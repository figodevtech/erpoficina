export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // evita cache do Next para sempre trazer contadores atuais

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Status oficiais no banco
const STATUSES = ["ABERTO", "EM_ANDAMENTO", "PAGAMENTO", "CONCLUIDO", "CANCELADO"] as const;
type DBStatus = (typeof STATUSES)[number];

async function countByStatus(status: DBStatus) {
  const { count, error } = await supabaseAdmin
    .from("ordemservico")
    .select("*", { count: "exact", head: true })
    .eq("status", status);

  if (error) throw error;
  return count ?? 0;
}

export async function GET() {
  try {
    // Conta todos de uma vez
    const results = await Promise.all(STATUSES.map((s) => countByStatus(s)));

    const counters: Record<DBStatus, number> = {
      ABERTO: results[0],
      EM_ANDAMENTO: results[1],
      PAGAMENTO: results[2],
      CONCLUIDO: results[3],
      CANCELADO: results[4],
    };

    const total = Object.values(counters).reduce((a, b) => a + b, 0);

    // A UI (OrdensTabs) já lê "counters" primeiro. Assim garantimos compatibilidade.
    return NextResponse.json({ counters, total });
  } catch (e: any) {
    const msg = e?.message ?? "Erro ao calcular estatísticas";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
