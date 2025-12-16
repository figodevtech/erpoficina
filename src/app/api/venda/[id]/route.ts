// src/app/api/venda/[id]/route.ts

export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Status = "ABERTA" | "PAGAMENTO" | "FINALIZADA" | "CANCELADA";
const STATUS_SET = new Set<Status>([
  "ABERTA",
  "PAGAMENTO",
  "FINALIZADA",
  "CANCELADA",
]);

/**
 * SELECT padrão da venda com cliente e itens (vendaproduto) + produto.
 * Atenção:
 * - vendaproduto usa venda_id
 * - produto embed via FK produtoid
 */
const VENDA_SELECT = `
  id,
  clienteid,
  cliente:cliente (
    id,
    nomerazaosocial
  ),
  status,
  valortotal,
  datavenda,
  createdat,
  updatedat,
  usuariocriadorid,
  desconto_tipo,
  desconto_valor,
  sub_total,
  itens:vendaproduto (
    id,
    venda_id,
    produtoid,
    quantidade,
    sub_total,
    valor_total,
    valor_desconto,
    tipo_desconto,
    created_at,
    updated_at,
    produto:produtoid (
      id,
      titulo,
      descricao,
      precovenda,
      imgUrl,
      ncm,
      unidade,
      codigobarras,
      csosn,
      cst,
      cest,
      aliquotaicms,
      cfop,
      cst_pis,
      aliquota_pis,
      cst_cofins,
      aliquota_cofins
    )
  )
`;

type VendaPatchBody = {
  clienteId?: number;
  status?: string;
  descontoTipo?: string | null;
  descontoValor?: number | null;
  subTotal?: number;
  valorTotal?: number;
  dataVenda?: string | null; // ISO string
};

// Contexto esperado pelo typed routes do Next 15
type ParamsCtx = { params: Promise<{ id: string }> };

/* ========================= Helpers ========================= */

function parseId(idStr: string) {
  if (!idStr) {
    return {
      error: 'Parâmetro "id" é obrigatório na URL.',
      status: 400,
      id: null as number | null,
    };
  }

  const id = Number(idStr);
  if (Number.isNaN(id)) {
    return {
      error: 'Parâmetro "id" inválido. Deve ser numérico.',
      status: 400,
      id: null as number | null,
    };
  }

  return { id, error: null as string | null, status: 200 };
}

/* ========================= GET /api/venda/[id] ========================= */
/**
 * Retorna uma venda específica com itens + produto
 */
export async function GET(req: NextRequest, ctx: ParamsCtx) {
  try {
    // só pra não dar warning de variável não usada
    req;

    const { id: idStr } = await ctx.params;
    const parsed = parseId(idStr);

    if (parsed.error) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      );
    }

    const vendaId = parsed.id as number;

    const { data, error } = await supabaseAdmin
      .from("venda")
      .select(VENDA_SELECT)
      .eq("id", vendaId)
      .single();

    if (error) {
      console.error("Erro ao buscar venda por id:", error);
      return NextResponse.json(
        { error: "Erro ao buscar venda." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Venda não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    console.error("Erro inesperado no GET /venda/[id]:", e);
    return NextResponse.json(
      { error: e?.message || "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

/* ========================= PATCH /api/venda/[id] ========================= */
/**
 * Atualiza campos básicos da venda.
 * Obs: NÃO atualiza itens (vendaproduto), apenas campos diretos de venda.
 */
export async function PATCH(req: NextRequest, ctx: ParamsCtx) {
  try {
    const { id: idStr } = await ctx.params;
    const parsed = parseId(idStr);

    if (parsed.error) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      );
    }

    const vendaId = parsed.id as number;
    const body = (await req.json().catch(() => null)) as VendaPatchBody | null;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Body inválido. Envie um JSON com campos a atualizar." },
        { status: 400 }
      );
    }

    const {
      clienteId,
      status,
      descontoTipo,
      descontoValor,
      subTotal,
      valorTotal,
      dataVenda,
    } = body;

    // Nenhum campo enviado
    if (
      clienteId === undefined &&
      status === undefined &&
      descontoTipo === undefined &&
      descontoValor === undefined &&
      subTotal === undefined &&
      valorTotal === undefined &&
      dataVenda === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Nenhum campo para atualização foi enviado. Informe pelo menos um campo.",
        },
        { status: 400 }
      );
    }

    const updatePayload: any = {};

    if (clienteId !== undefined) {
      if (clienteId === null || Number.isNaN(Number(clienteId))) {
        return NextResponse.json({ error: "clienteId inválido." }, { status: 400 });
      }
      updatePayload.clienteid = clienteId;
    }

    if (status !== undefined) {
      const upperStatus = String(status).toUpperCase();
      if (!STATUS_SET.has(upperStatus as Status)) {
        return NextResponse.json(
          {
            error: `Status inválido. Use um dos: ${Array.from(STATUS_SET).join(
              ", "
            )}.`,
          },
          { status: 400 }
        );
      }
      updatePayload.status = upperStatus;
    }

    if (descontoTipo !== undefined) {
      updatePayload.desconto_tipo = descontoTipo;
    }

    if (descontoValor !== undefined) {
      updatePayload.desconto_valor = descontoValor;
    }

    if (subTotal !== undefined) {
      updatePayload.sub_total = subTotal;
    }

    if (valorTotal !== undefined) {
      updatePayload.valortotal = valorTotal;
    }

    if (dataVenda !== undefined) {
      updatePayload.datavenda = dataVenda;
    }

    // Se sua tabela venda tiver updatedat e você quiser forçar:
    updatePayload.updatedat = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("venda")
      .update(updatePayload)
      .eq("id", vendaId)
      .select(VENDA_SELECT)
      .single();

    if (error) {
      console.error("Erro ao atualizar venda:", error);
      return NextResponse.json(
        { error: "Erro ao atualizar venda." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Venda não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Venda atualizada com sucesso.",
      data,
    });
  } catch (e: any) {
    console.error("Erro inesperado no PATCH /venda/[id]:", e);
    return NextResponse.json(
      { error: e?.message || "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

/* ========================= DELETE /api/venda/[id] ========================= */
/**
 * Remove uma venda.
 *
 * IMPORTANTE: Agora vendaproduto tem ON DELETE CASCADE, então
 * os itens não vão bloquear o delete.
 *
 * Porém, sua tabela transacao tem FK para venda (vendaid) sem cascade,
 * então ainda pode bloquear.
 */
export async function DELETE(req: NextRequest, ctx: ParamsCtx) {
  try {
    req;

    const { id: idStr } = await ctx.params;
    const parsed = parseId(idStr);

    if (parsed.error) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      );
    }

    const vendaId = parsed.id as number;

    // 1) Bloqueia exclusão se já existe NF-e vinculada à venda
    //    que NÃO esteja em RASCUNHO (ex: AUTORIZADA, CANCELADA, DENEGADA, REJEITADA etc.)
    const { data: nfesBloqueantes, error: nfeError } = await supabaseAdmin
      .from("nfe")
      .select("id, status, chave_acesso, protocolo")
      .eq("vendaid", vendaId)
      .neq("status", "RASCUNHO")
      .limit(1);

    if (nfeError) {
      console.error("Erro ao verificar NF-e vinculadas à venda:", nfeError);
      return NextResponse.json(
        {
          error:
            "Erro ao verificar NF-e vinculadas à venda. Exclusão não realizada.",
        },
        { status: 500 }
      );
    }

    if (nfesBloqueantes && nfesBloqueantes.length > 0) {
      const nfe = nfesBloqueantes[0];
      return NextResponse.json(
        {
          error:
            "Não é possível excluir a venda pois existe NF-e vinculada (já enviada/registrada na SEFAZ).",
          nfeVinculada: {
            id: nfe.id,
            status: nfe.status,
            chave_acesso: nfe.chave_acesso,
            protocolo: nfe.protocolo,
          },
        },
        { status: 409 } // conflito de regra de negócio
      );
    }

    // 2) Verifica se existe transação ligada a essa venda
    const { count: transCount, error: transError } = await supabaseAdmin
      .from("transacao")
      .select("id", { count: "exact", head: true })
      .eq("vendaid", vendaId);

    if (transError) {
      console.error(
        "Erro ao verificar transações relacionadas à venda:",
        transError
      );
      return NextResponse.json(
        {
          error:
            "Erro ao verificar transações relacionadas à venda. Exclusão não realizada.",
        },
        { status: 500 }
      );
    }

    if ((transCount ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            "Não é possível excluir a venda pois existem transações vinculadas a ela.",
          transacoesVinculadas: transCount,
        },
        { status: 409 }
      );
    }

    // 3) Agora pode excluir (vendaproduto cai em cascade)
    const { data, error } = await supabaseAdmin
      .from("venda")
      .delete()
      .eq("id", vendaId)
      .select("id")
      .single();

    if (error) {
      console.error("Erro ao excluir venda:", error);
      return NextResponse.json(
        { error: "Erro ao excluir venda." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Venda não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Venda excluída com sucesso.",
      id: data.id,
    });
  } catch (e: any) {
    console.error("Erro inesperado no DELETE /venda/[id]:", e);
    return NextResponse.json(
      { error: e?.message || "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

