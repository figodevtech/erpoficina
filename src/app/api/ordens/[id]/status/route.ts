// /src/app/api/ordens/[id]/status/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server role
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Opcional: validação básica contra seus enums
const VALID_STATUSES = new Set([
  "ORCAMENTO",
  "APROVACAO_ORCAMENTO",
  "ORCAMENTO_APROVADO",
  "ORCAMENTO_RECUSADO",
  "EM_ANDAMENTO",
  "PAGAMENTO",
  "CONCLUIDO",
  "CANCELADO",
]);

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const osId = Number(id);
    if (!osId || Number.isNaN(osId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const novoStatus = String(body?.status || "").toUpperCase();

    if (!VALID_STATUSES.has(novoStatus)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    // OS atual
    const { data: os, error: osErr } = await supabase
      .from("ordemservico")
      .select("id, status")
      .eq("id", osId)
      .maybeSingle();
    if (osErr) throw osErr;
    if (!os) return NextResponse.json({ error: "OS não encontrada" }, { status: 404 });

    // Nada a fazer se já estiver no mesmo status
    if (os.status === novoStatus) {
      return NextResponse.json({ ok: true, id: osId, status: novoStatus });
    }

    // Se for CANCELADO: apaga itens para os TRIGGERS devolverem estoque e então atualiza status
    if (novoStatus === "CANCELADO") {
      // 1) apaga itens de produto (trigger repõe estoque)
      const delP = await supabase.from("osproduto").delete().eq("ordemservicoid", osId);
      if (delP.error) throw delP.error;

      // 2) apaga itens de serviço (não afeta estoque)
      const delS = await supabase.from("osservico").delete().eq("ordemservicoid", osId);
      if (delS.error) throw delS.error;

      // 3) atualiza status da OS
      const updOS = await supabase.from("ordemservico").update({ status: novoStatus }).eq("id", osId);
      if (updOS.error) throw updOS.error;

      return NextResponse.json({ ok: true, id: osId, status: novoStatus, clearedItems: true });
    }

    // Demais status: apenas atualiza (sem mexer em estoque)
    const upd = await supabase.from("ordemservico").update({ status: novoStatus }).eq("id", osId);
    if (upd.error) throw upd.error;

    return NextResponse.json({ ok: true, id: osId, status: novoStatus });
  } catch (e: any) {
    console.error("PUT /api/ordens/[id]/status", e);
    return NextResponse.json({ error: e?.message ?? "Erro ao alterar status" }, { status: 500 });
  }
}
