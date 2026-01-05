// app/api/veiculos/status-counter/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type VeiculoRow = { tipo: string | null };

export async function GET() {
  try {
    const listPromise = supabaseAdmin.from("veiculo").select("tipo");

    const totalPromise = supabaseAdmin
      .from("veiculo")
      .select("*", { count: "exact", head: true });

    const [{ data, error }, { count, error: countError }] = await Promise.all([
      listPromise,
      totalPromise,
    ]);

    if (error) throw error;
    if (countError) throw countError;

    const rows = (data ?? []) as VeiculoRow[];

    const countsByTipo = rows.reduce<Record<string, number>>((acc, row) => {
      const key = String(row.tipo ?? "NULL");
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return NextResponse.json(
      { countsByTipo, totalVehicles: count ?? 0 },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erro ao contar veículos por tipo" },
      { status: 500 }
    );
  }
}
