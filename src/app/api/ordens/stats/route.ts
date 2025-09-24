export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function countByStatus(status: string) {
  const { count, error } = await supabaseAdmin
    .from("ordemservico")
    .select("*", { count: "exact", head: true })
    .eq("status", status);
  if (error) throw error;
  return count ?? 0;
}

export async function GET() {
  try {
    const [abertas, emAndamento, concluidas, canceladas] = await Promise.all([
      countByStatus("ABERTA"),
      countByStatus("EM_ANDAMENTO"),
      countByStatus("CONCLUIDA"),
      countByStatus("CANCELADA"),
    ]);

    // Atrasadas: não concluídas com data de saída prevista passada
    const nowIso = new Date().toISOString();
    const { count: atrasadas, error: errAtraso } = await supabaseAdmin
      .from("ordemservico")
      .select("*", { count: "exact", head: true })
      .lt("datasaidaprevista", nowIso)
      .neq("status", "CONCLUIDA");
    if (errAtraso) throw errAtraso;

    return NextResponse.json({
      abertas,
      em_andamento: emAndamento,
      concluidas,
      canceladas,
      atrasadas: atrasadas ?? 0,
    });
  } catch (e: any) {
    const msg = e?.message ?? "Erro ao calcular estatísticas";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
