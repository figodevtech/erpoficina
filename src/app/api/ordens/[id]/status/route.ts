import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type DBStatusOS =
  | "AGUARDANDO_CHECKLIST"
  | "ORCAMENTO"
  | "APROVACAO_ORCAMENTO"
  | "ORCAMENTO_APROVADO"
  | "ORCAMENTO_RECUSADO"
  | "EM_ANDAMENTO"
  | "PAGAMENTO"
  | "CONCLUIDO"
  | "CANCELADO";

type DBAprovacao = "PENDENTE" | "APROVADA" | "REPROVADA";

type Body = {
  status: DBStatusOS;
};

type ParamsId = { id: string };

export async function PUT(req: NextRequest, { params }: { params: Promise<ParamsId> }) {
  try {
    const { id } = await params;
    const osId = Number(id);

    if (!osId) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = (await req.json()) as Body;
    const status = body.status;

    if (!status) {
      return NextResponse.json({ error: "Status é obrigatório." }, { status: 400 });
    }

    // define statusaprovacao em função do novo status
    let statusaprovacao: DBAprovacao | null = null;

    if (status === "ORCAMENTO_APROVADO") {
      statusaprovacao = "APROVADA";
    } else if (status === "ORCAMENTO_RECUSADO") {
      statusaprovacao = "REPROVADA";
    } else if (status === "ORCAMENTO" || status === "APROVACAO_ORCAMENTO" || status === "AGUARDANDO_CHECKLIST") {
      statusaprovacao = "PENDENTE";
    }

    const updateData: any = { status };

    if (statusaprovacao !== null) {
      updateData.statusaprovacao = statusaprovacao;
    }

    // 👉 datasaida: quando a OS é concluída
    if (status === "CONCLUIDO") {
      updateData.datasaida = new Date().toISOString();
    }

    const upd = await supabaseAdmin.from("ordemservico").update(updateData).eq("id", osId);

    if (upd.error) throw upd.error;

    // opcional: marcar tokens da OS como "usados" quando aprovar/reprovar
    if (status === "ORCAMENTO_APROVADO" || status === "ORCAMENTO_RECUSADO") {
      const desiredAprov: DBAprovacao = status === "ORCAMENTO_APROVADO" ? "APROVADA" : "REPROVADA";

      const mark = await supabaseAdmin
        .from("osaprovacao")
        .update({
          usado_em: new Date().toISOString(),
          origem: "SISTEMA",
          resultado: desiredAprov,
        })
        .eq("ordemservicoid", osId)
        .is("usado_em", null);

      if (mark.error) {
        console.error("Falha ao marcar tokens de aprovação como usados", mark.error);
      }
    }

    return NextResponse.json({ ok: true, status, statusaprovacao }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/ordens/[id]/status", err);
    return NextResponse.json({ error: err?.message || "Falha ao atualizar status" }, { status: 500 });
  }
}
