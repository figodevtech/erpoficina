// src/app/api/ordens/stats/route.ts
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
    const [
      orcamento,
      aprovacao,
      emAndamento,
      pagamento,
      concluido,
      cancelado,
    ] = await Promise.all([
      countByStatus("ORCAMENTO"),
      countByStatus("APROVACAO_ORCAMENTO"),
      countByStatus("EM_ANDAMENTO"),
      countByStatus("PAGAMENTO"),
      countByStatus("CONCLUIDO"),
      countByStatus("CANCELADO"),
    ]);

    return NextResponse.json({
      counters: {
        ORCAMENTO: orcamento,
        APROVACAO_ORCAMENTO: aprovacao,
        EM_ANDAMENTO: emAndamento,
        PAGAMENTO: pagamento,
        CONCLUIDO: concluido,
        CANCELADO: cancelado,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Erro ao calcular estatísticas" }, { status: 500 });
  }
}
