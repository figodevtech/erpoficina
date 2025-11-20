// src/app/api/ordens/criar/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/** enums do banco */
type DBChecklistStatus = "OK" | "ALERTA" | "FALHA";
type DBAlvo = "VEICULO" | "PECA";
type DBPrioridade = "BAIXA" | "NORMAL" | "ALTA";

type Payload = {
  setorid: number | null;
  veiculoid: number | null;
  descricao: string | null;
  observacoes: string | null;
  // legado: mantido apenas para compatibilidade, hoje ignorado na criação da OS
  checklistTemplateId?: string | null;
  prioridade?: DBPrioridade;
  cliente:
    | { id: number }
    | {
        nome: string;
        documento: string;
        telefone?: string | null;
        email?: string | null;
      };

  alvo?: {
    tipo: DBAlvo;
    veiculo?: {
      placa?: string | null;
      modelo?: string | null;
      marca?: string | null;
      ano?: number | null;
      cor?: string | null;
      kmatual?: number | null;
    };
    peca?: { nome: string; descricao?: string | null };
  };

  // legado: checklist completo agora é salvo em /api/ordens/[id]/checklist
  checklist?: Array<{
    item: string;
    status?: DBChecklistStatus | string | null | undefined;
    observacao?: string | null;
  }>;
};

function onlyDigits(s: string) {
  return (s || "").replace(/\D+/g, "");
}

function deduzTipoPessoa(documento: string): "FISICA" | "JURIDICA" {
  const d = onlyDigits(documento);
  return d.length === 14 ? "JURIDICA" : "FISICA";
}

// função de normalização de prioridade
function normPrioridade(v: any): DBPrioridade {
  const t = String(v ?? "")
    .trim()
    .toUpperCase();
  return t === "BAIXA" || t === "ALTA" ? (t as DBPrioridade) : "NORMAL";
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const usuariocriadorid = (session?.user as any)?.id as string | undefined;
    if (!usuariocriadorid) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = (await req.json()) as Payload;

    if (!body?.setorid) {
      return NextResponse.json({ error: "setorid é obrigatório" }, { status: 400 });
    }

    const setorid = Number(body.setorid);
    const prioridade = normPrioridade(body.prioridade);

    // ========= Resolve cliente =========
    let clienteid: number | null = null;
    if ("id" in body.cliente && typeof body.cliente.id === "number") {
      clienteid = body.cliente.id;
    } else {
      const nome = (body.cliente as any)?.nome?.trim();
      const documento = onlyDigits((body.cliente as any)?.documento || "");
      if (!nome || !documento) {
        return NextResponse.json({ error: "Dados de cliente inválidos" }, { status: 400 });
      }
      const tipopessoa = deduzTipoPessoa(documento);

      const { data: ja, error: eJa } = await supabaseAdmin
        .from("cliente")
        .select("id")
        .eq("cpfcnpj", documento)
        .limit(1)
        .maybeSingle();
      if (eJa) throw eJa;

      if (ja?.id) {
        clienteid = ja.id;
      } else {
        const { data: novo, error: eNovo } = await supabaseAdmin
          .from("cliente")
          .insert({
            tipopessoa,
            cpfcnpj: documento,
            nomerazaosocial: nome,
            email: (body.cliente as any)?.email || null,
            telefone: (body.cliente as any)?.telefone || null,
            // campos como cidade/estado você pode preencher aqui se quiser
          })
          .select("id")
          .single();
        if (eNovo) throw eNovo;
        clienteid = novo.id;
      }
    }

    // ========= Resolve alvo (veículo/peça) =========
    let alvo_tipo: DBAlvo = "VEICULO";
    let veiculoid: number | null = body?.veiculoid ? Number(body.veiculoid) : null;
    let pecaid: number | null = null;

    // ids criados nesta chamada (rollback se der ruim)
    let createdVeiculoId: number | null = null;
    let createdPecaId: number | null = null;

    const alvo = body?.alvo;
    if (!alvo) {
      if (!veiculoid) {
        return NextResponse.json(
          {
            error:
              "Informe o 'alvo' (VEICULO/PECA). Quando VEICULO, selecione um veículo ou informe placa, modelo e marca.",
          },
          { status: 400 }
        );
      }
      alvo_tipo = "VEICULO";
    } else if (alvo.tipo === "VEICULO") {
      alvo_tipo = "VEICULO";

      if (!veiculoid) {
        const placa = (alvo.veiculo?.placa || "").trim();
        const modelo = (alvo.veiculo?.modelo || "").trim() || "N/I";
        const marca = (alvo.veiculo?.marca || "").trim() || "N/I";
        const ano = alvo.veiculo?.ano ?? null;
        const cor = (alvo.veiculo?.cor || "").trim() || null;
        const kmatual = alvo.veiculo?.kmatual ?? null;

        if (!placa) {
          return NextResponse.json(
            {
              error: "Para alvo VEICULO sem vínculo, informe ao menos a PLACA (modelo/marca recomendados).",
            },
            { status: 400 }
          );
        }

        const { data: vNew, error: eVNew } = await supabaseAdmin
          .from("veiculo")
          .insert({
            clienteid,
            placa,
            modelo,
            marca,
            ano,
            cor,
            kmatual,
          })
          .select("id")
          .single();
        if (eVNew) throw eVNew;
        veiculoid = vNew.id;
        createdVeiculoId = vNew.id;
      }
      pecaid = null;
    } else if (alvo.tipo === "PECA") {
      alvo_tipo = "PECA";

      const nome = (alvo.peca?.nome || "").trim();
      if (!nome) {
        return NextResponse.json({ error: "Para alvo PECA, informe o nome da peça." }, { status: 400 });
      }

      const { data: pNew, error: eP } = await supabaseAdmin
        .from("peca")
        .insert({
          clienteid,
          veiculoid: veiculoid || null,
          titulo: nome,
          descricao: (alvo.peca?.descricao || null) as any,
        })
        .select("id")
        .single();
      if (eP) throw eP;

      pecaid = pNew.id;
      createdPecaId = pNew.id; // 👈 agora de fato usamos createdPecaId
    } else {
      return NextResponse.json({ error: "alvo.tipo inválido" }, { status: 400 });
    }

    // ========= Cria OS =========
    const { data: os, error: eOS } = await supabaseAdmin
      .from("ordemservico")
      .insert({
        clienteid,
        veiculoid,
        pecaid,
        alvo_tipo,
        usuariocriadorid,
        setorid,
        prioridade,
        descricao: body.descricao || null,
        observacoes: body.observacoes || null,
        status: "AGUARDANDO_CHECKLIST",
      })
      .select("id")
      .single();

    if (eOS) {
      // rollback básico se falhar ao criar OS
      if (createdPecaId) {
        await supabaseAdmin.from("peca").delete().eq("id", createdPecaId);
      }
      if (createdVeiculoId) {
        await supabaseAdmin.from("veiculo").delete().eq("id", createdVeiculoId);
      }
      throw eOS;
    }

    const osId = os.id as number;

    return NextResponse.json({ id: osId }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/ordens/criar", err);
    return NextResponse.json({ error: err?.message || "Falha ao criar OS" }, { status: 500 });
  }
}
