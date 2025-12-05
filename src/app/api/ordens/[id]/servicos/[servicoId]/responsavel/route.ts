// /src/app/api/ordens/[id]/servicos/[servicoId]/responsavel/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string; servicoId: string }> }) {
  try {
    const { id, servicoId } = await ctx.params;
    const ordemservicoid = Number(id);
    const servicoid = Number(servicoId);

    if (!ordemservicoid || !servicoid) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({} as any));
    const raw = body?.idusuariorealizador;

    const idusuariorealizador = typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : null;

    const os_res = await supabase.from("ordemservico").select("status").eq("id", ordemservicoid).maybeSingle();

    if (os_res.error) throw os_res.error;
    if (!os_res.data) {
      return NextResponse.json({ error: "OS não encontrada" }, { status: 404 });
    }

    const status = String(os_res.data.status || "").toUpperCase();

    if (status !== "ORCAMENTO_APROVADO" && status !== "EM_ANDAMENTO") {
      return NextResponse.json(
        {
          error: "Só é possível definir responsáveis quando a OS está em ORCAMENTO_APROVADO ou EM_ANDAMENTO.",
        },
        { status: 400 }
      );
    }

    // 🧩 Atualiza o realizador daquele serviço ESPECÍFICO dessa OS
    const upd_res = await supabase
      .from("osservico")
      .update({ idusuariorealizador })
      .eq("ordemservicoid", ordemservicoid)
      .eq("servicoid", servicoid)
      .select(
        `
          ordemservicoid,
          servicoid,
          idusuariorealizador,
          realizador:idusuariorealizador (id, nome)
        `
      )
      .maybeSingle();

    if (upd_res.error) throw upd_res.error;
    if (!upd_res.data) {
      return NextResponse.json({ error: "Serviço não encontrado na OS" }, { status: 404 });
    }

    const row: any = upd_res.data;

    return NextResponse.json({
      ordemservicoid: row.ordemservicoid,
      servicoid: row.servicoid,
      idusuariorealizador: row.idusuariorealizador,
      realizador: row.realizador
        ? {
            id: String(row.realizador.id),
            nome: row.realizador.nome ?? null,
          }
        : null,
    });
  } catch (e: any) {
    console.error("PUT /api/ordens/[id]/servicos/[servicoId]/responsavel", e);
    return NextResponse.json({ error: e?.message ?? "Erro ao atualizar responsável" }, { status: 500 });
  }
}
