// app/api/ordens/status-counter/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Row = { status: string | null };

// Se quiser garantir certas chaves no retorno mesmo que não existam no banco,
// ajuste aqui a lista de status “esperados”:
const EXPECTED_STATUSES = ["ORCAMENTO", "EM_ANDAMENTO", "CONCLUIDA", "CANCELADA"] as const;

export async function GET() {
  try {
    // Busca somente a coluna necessária; count: "exact" para retornar o total de linhas
    const { data, error, count } = await supabaseAdmin
      .from("ordemservico")
      .select("status", { count: "exact" })
      .returns<Row[]>();

    if (error) throw error;

    const rows = data ?? [];
    const totalOrders = typeof count === "number" ? count : rows.length;

    // Acumulador por status (inclui bucket "NULL" para registros sem status)
    const countsByStatus: Record<string, number> = {};

    for (const r of rows) {
      const key = r.status ?? "NULL";
      countsByStatus[key] = (countsByStatus[key] ?? 0) + 1;
    }

    // Garante chaves padrão com 0 (sem sobrescrever o que já foi contado)
    for (const k of EXPECTED_STATUSES) {
      if (!(k in countsByStatus)) countsByStatus[k] = 0;
    }
    // Mantém "NULL" apenas se houver registros sem status
    if (countsByStatus["NULL"] === 0) {
      delete countsByStatus["NULL"];
    }

    return NextResponse.json(
      {
        totalOrders,
        countsByStatus,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: any) {
    console.error("[/api/ordens/status-counter] Error:", e);
    return NextResponse.json(
      { error: e?.message || "Erro ao carregar status das ordens de serviço" },
      { status: 500 },
    );
  }
}
