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
  checklistTemplateId?: string | null; // legado
  prioridade?: DBPrioridade;

  // ✅ agora é obrigatório ser cliente cadastrado
  cliente: { id: number };

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

  checklist?: Array<{
    item: string;
    status?: DBChecklistStatus | string | null | undefined;
    observacao?: string | null;
  }>;
};

function normPrioridade(v: any): DBPrioridade {
  const t = String(v ?? "").trim().toUpperCase();
  return t === "BAIXA" || t === "ALTA" ? (t as DBPrioridade) : "NORMAL";
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const usuariocriadorid = (session?.user as any)?.id as string | undefined;
    if (!usuariocriadorid) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = (await req.json()) as any;

    if (!body?.setorid) {
      return NextResponse.json({ error: "setorid é obrigatório" }, { status: 400 });
    }

    // ✅ bloqueia payload antigo/avulso
    if (!body?.cliente || typeof body.cliente?.id !== "number") {
      return NextResponse.json({ error: "Cliente deve ser cadastrado (cliente.id é obrigatório)." }, { status: 400 });
    }

    const payload = body as Payload;

    const setorid = Number(payload.setorid);
    const prioridade = normPrioridade(payload.prioridade);

    // ========= Resolve cliente =========
    const clienteid = Number(payload.cliente.id);

    // (opcional mas recomendado) valida se existe
    const { data: cRow, error: cErr } = await supabaseAdmin.from("cliente").select("id").eq("id", clienteid).maybeSingle();
    if (cErr) throw cErr;
    if (!cRow?.id) {
      return NextResponse.json({ error: "Cliente não encontrado." }, { status: 400 });
    }

    // ========= Resolve alvo (veículo/peça) =========
    let alvo_tipo: DBAlvo = "VEICULO";
    let veiculoid: number | null = payload?.veiculoid ? Number(payload.veiculoid) : null;
    let pecaid: number | null = null;

    // ids criados nesta chamada (rollback se der ruim)
    let createdVeiculoId: number | null = null;
    let createdPecaId: number | null = null;

    const alvo = payload?.alvo;

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
            { error: "Para alvo VEICULO sem vínculo, informe ao menos a PLACA (modelo/marca recomendados)." },
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
      createdPecaId = pNew.id;
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
        descricao: payload.descricao || null,
        observacoes: payload.observacoes || null,
        status: "AGUARDANDO_CHECKLIST",
      })
      .select("id")
      .single();

    if (eOS) {
      if (createdPecaId) await supabaseAdmin.from("peca").delete().eq("id", createdPecaId);
      if (createdVeiculoId) await supabaseAdmin.from("veiculo").delete().eq("id", createdVeiculoId);
      throw eOS;
    }

    return NextResponse.json({ id: os.id as number }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/ordens/criar", err);
    return NextResponse.json({ error: err?.message || "Falha ao criar OS" }, { status: 500 });
  }
}
