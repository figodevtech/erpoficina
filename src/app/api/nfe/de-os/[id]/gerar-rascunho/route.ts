// src/app/api/nfe/de-os/[osId]/gerar-rascunho/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildNFePreviewXml } from "@/lib/nfe/buildNFe";
import { mapClienteToDestinatario } from "@/lib/nfe/mapClienteToDestinatario";
import type { ClienteRow, EmpresaRow, NFeItem } from "@/lib/nfe/types";

export const runtime = "nodejs";

type BodyRequest = {
  itens: number[]; // array de produtoid selecionados no diálogo
};

// Extrai o osId direto da URL: /api/nfe/de-os/95/gerar-rascunho
function getOsIdFromUrl(req: Request): number | null {
  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  // ex: ["", "api", "nfe", "de-os", "95", "gerar-rascunho"]
  const idx = parts.indexOf("de-os");
  if (idx === -1 || idx + 1 >= parts.length) return null;

  const raw = parts[idx + 1];
  const n = Number(raw);
  if (Number.isNaN(n)) return null;
  return n;
}

export async function POST(req: Request) {
  try {
    const idOs = getOsIdFromUrl(req);

    if (idOs === null) {
      return NextResponse.json(
        {
          ok: false,
          message: "Parâmetro 'osId' inválido (deve ser numérico).",
        },
        { status: 400 }
      );
    }

    const body = (await req.json().catch(() => null)) as BodyRequest | null;

    if (!body || !Array.isArray(body.itens) || body.itens.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Body inválido. Envie um JSON com { itens: number[] } contendo pelo menos um item.",
        },
        { status: 400 }
      );
    }

    const itensSelecionados = body.itens
      .map((n) => Number(n))
      .filter((n) => !Number.isNaN(n));

    if (itensSelecionados.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Nenhum item válido foi enviado para gerar a NF-e.",
        },
        { status: 400 }
      );
    }

    // 1) Criar cabeçalho da NF-e (igual à rota /api/nfe/de-os/[id])
    const { data: criarData, error: criarError } = await supabaseAdmin.rpc(
      "criar_nfe_de_os",
      {
        p_ordemservicoid: idOs,
      }
    );

    if (criarError) {
      console.error("[criar_nfe_de_os] erro:", criarError);
      return NextResponse.json(
        {
          ok: false,
          message: "Erro ao criar NF-e a partir da OS",
          detalhe: criarError.message,
        },
        { status: 500 }
      );
    }

    const nfeId: number | null = Array.isArray(criarData)
      ? (criarData[0] as number)
      : (criarData as number | null);

    if (!nfeId) {
      return NextResponse.json(
        {
          ok: false,
          message: "Função criar_nfe_de_os não retornou id",
        },
        { status: 500 }
      );
    }

    // 2) Preencher itens na nfe_item com base em TODOS os produtos da OS
    const { error: itensError } = await supabaseAdmin.rpc(
      "preencher_itens_nfe_de_os",
      {
        p_nfe_id: nfeId,
      }
    );

    if (itensError) {
      console.error("[preencher_itens_nfe_de_os] erro:", itensError);
      return NextResponse.json(
        {
          ok: false,
          message: "Erro ao preencher itens da NF-e",
          detalhe: itensError.message,
        },
        { status: 500 }
      );
    }

    // 3) Buscar itens da nfe_item para esse nfeId
    const { data: itensNfe, error: itensNfeError } = await supabaseAdmin
      .from("nfe_item")
      .select(
        `
        n_item,
        produtoid,
        descricao,
        ncm,
        cfop,
        unidade,
        quantidade,
        valor_unitario,
        valor_total
      `
      )
      .eq("nfe_id", nfeId);

    if (itensNfeError) {
      console.error("[select nfe_item] erro:", itensNfeError);
      return NextResponse.json(
        {
          ok: false,
          message: "Erro ao buscar itens da NF-e recém criada.",
          detalhe: itensNfeError.message,
        },
        { status: 500 }
      );
    }

    // Se por algum motivo não veio item nenhum, não faz sentido seguir
    if (!itensNfe || itensNfe.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Nenhum item foi gerado em nfe_item pela função preencher_itens_nfe_de_os.",
        },
        { status: 500 }
      );
    }

    // 4) Determinar quais produtos precisam ser removidos da nota
    const todosProdutosDaNfe = Array.from(
      new Set(
        itensNfe
          .map((i: any) => Number(i.produtoid))
          .filter((n) => !Number.isNaN(n))
      )
    );

    const produtosParaRemover = todosProdutosDaNfe.filter(
      (pid) => !itensSelecionados.includes(pid)
    );

    if (produtosParaRemover.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from("nfe_item")
        .delete()
        .eq("nfe_id", nfeId)
        .in("produtoid", produtosParaRemover);

      if (deleteError) {
        console.error("[delete nfe_item] erro:", deleteError);
        return NextResponse.json(
          {
            ok: false,
            message: "Erro ao remover itens não selecionados da NF-e.",
            detalhe: deleteError.message,
          },
          { status: 500 }
        );
      }
    }

    // 5) Atualizar totais da NF-e com base nos itens que sobraram
    const { error: totalError } = await supabaseAdmin.rpc(
      "atualizar_totais_nfe",
      {
        p_nfe_id: nfeId,
      }
    );

    if (totalError) {
      console.error("[atualizar_totais_nfe] erro:", totalError);
      return NextResponse.json(
        {
          ok: false,
          message: "Erro ao atualizar totais da NF-e",
          detalhe: totalError.message,
        },
        { status: 500 }
      );
    }

    // 6) Buscar a NF-e completa pra montar XML de rascunho
    const { data: nfe, error: nfeError } = await supabaseAdmin
      .from("nfe")
      .select(
        `
        id,
        modelo,
        serie,
        numero,
        chave_acesso,
        ambiente,
        status,
        ordemservicoid,
        vendaid,
        clienteid,
        empresaid,
        dataemissao
      `
      )
      .eq("id", nfeId)
      .maybeSingle();

    if (nfeError || !nfe) {
      console.error("[select nfe] erro:", nfeError);
      return NextResponse.json(
        {
          ok: false,
          message: "Erro ao buscar NF-e recém criada.",
          detalhe: nfeError?.message ?? "NF-e não encontrada",
        },
        { status: 500 }
      );
    }

    // 7) Montar XML de rascunho (sem assinatura) com itens e destinatário
    const { data: empresa, error: empError } = await supabaseAdmin
      .from("empresa")
      .select("*")
      .eq("id", nfe.empresaid)
      .single<EmpresaRow>();

    if (empError || !empresa) {
      console.error("[empresa] erro ao buscar empresa da NF-e:", empError);
      return NextResponse.json(
        {
          ok: false,
          message: "Erro ao buscar empresa da NF-e.",
          detalhe: empError?.message ?? "Empresa não encontrada",
        },
        { status: 500 }
      );
    }

    const { data: cliente, error: cliError } = await supabaseAdmin
      .from("cliente")
      .select(
        `
        id,
        cpfcnpj,
        nomerazaosocial,
        telefone,
        email,
        endereco,
        endereconumero,
        enderecocomplemento,
        bairro,
        cidade,
        estado,
        cep,
        inscricaoestadual,
        inscricaomunicipal,
        codigomunicipio
      `
      )
      .eq("id", nfe.clienteid)
      .single<ClienteRow>();

    if (cliError || !cliente) {
      console.error("[cliente] erro ao buscar cliente da NF-e:", cliError);
      return NextResponse.json(
        {
          ok: false,
          message: "Erro ao buscar cliente da NF-e.",
          detalhe: cliError?.message ?? "Cliente não encontrado",
        },
        { status: 500 }
      );
    }

    const itens: NFeItem[] = (itensNfe as any[]).map((row, idx) => ({
      numeroItem: Number(row.n_item ?? idx + 1),
      codigoProduto:
        row.produtoid != null ? String(row.produtoid) : String(row.n_item ?? idx + 1),
      descricao: row.descricao,
      ncm: row.ncm || "00000000",
      cfop: row.cfop,
      unidade: row.unidade,
      quantidade: Number(row.quantidade ?? 0),
      valorUnitario: Number(row.valor_unitario ?? 0),
      valorTotal: Number(row.valor_total ?? 0),
      codigoBarras: null,
    }));

    const destinatario = mapClienteToDestinatario(cliente, empresa);

    const { xml: xmlRascunho, chave } = buildNFePreviewXml(
      empresa,
      Number(nfe.numero),
      Number(nfe.serie),
      itens,
      destinatario
    );

    console.log(
      "[gerar-rascunho] chave_acesso gerada:",
      chave,
      "len:",
      (chave || "").length
    );

    // 8) Gravar XML de rascunho (não assinado) em xml_assinado e chave
    await supabaseAdmin
      .from("nfe")
      .update({
        xml_assinado: xmlRascunho,
        chave_acesso: chave,
        updatedat: new Date().toISOString(),
      })
      .eq("id", nfeId);

    return NextResponse.json(
      {
        ok: true,
        message: "NF-e criada a partir da OS com sucesso (apenas itens selecionados).",
        nfeId,
        nfe,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("[api/nfe/de-os/[osId]/gerar-rascunho] erro inesperado", e);
    return NextResponse.json(
      {
        ok: false,
        message: "Erro interno ao gerar NF-e a partir da OS.",
        detalhe: e?.message ?? String(e),
      },
      { status: 500 }
    );
  }
}
