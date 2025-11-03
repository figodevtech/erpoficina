export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Row = {
  status: "ATIVO" | "INATIVO" | "PENDENTE" | null;
  tipopessoa: "FISICA" | "JURIDICA" | null;
  estado: string | null;
  cidade: string | null;
  createdat: string | null;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const months = Math.min(
      Math.max(Number(url.searchParams.get("months") ?? 12), 1),
      36
    );

    // Busca colunas necessárias (sem paginação) e agrega em memória
    const { data, error } = await supabaseAdmin
      .from("cliente")
      .select("status, tipopessoa, estado, cidade, createdat")
      .returns<Row[]>();
    if (error) throw error;

    const rows = data ?? [];
    const totalClients = rows.length;

    const countsByStatus: Record<string, number> = {
      ATIVO: 0,
      INATIVO: 0,
      PENDENTE: 0,
    };
    const countsByTipo = { FISICA: 0, JURIDICA: 0 } as Record<
      "FISICA" | "JURIDICA",
      number
    >;
    const byEstado: Record<string, number> = {};
    const byCidade: Record<string, number> = {};

    const now = new Date();
    const ms30 = 30 * 24 * 60 * 60 * 1000;
    const startCurr = new Date(now.getTime() - ms30);
    const startPrev = new Date(now.getTime() - 2 * ms30);

    let recent30d = 0;
    let prev30d = 0;

    // série mensal dos últimos N meses
    const monthsKeys: string[] = [];
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    for (let i = 0; i < months; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      monthsKeys.push(ym);
    }
    const monthlyMap: Record<string, number> = Object.fromEntries(
      monthsKeys.map((k) => [k, 0])
    );

    for (const r of rows) {
      // status
      if (r.status && countsByStatus[r.status] !== undefined)
        countsByStatus[r.status]++;
      // tipo
      if (r.tipopessoa && countsByTipo[r.tipopessoa] !== undefined)
        countsByTipo[r.tipopessoa]++;
      // UF/cidade
      const uf = (r.estado ?? "").toUpperCase();
      if (uf) byEstado[uf] = (byEstado[uf] ?? 0) + 1;
      const cid = (r.cidade ?? "").trim();
      if (cid) byCidade[cid] = (byCidade[cid] ?? 0) + 1;
      // datas
      if (r.createdat) {
        const d = new Date(r.createdat);
        if (d >= startCurr) recent30d++;
        else if (d >= startPrev && d < startCurr) prev30d++;
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        if (monthlyMap[ym] !== undefined) monthlyMap[ym]++;
      }
    }

    const monthlyNew = monthsKeys.map((k) => ({
      month: k,
      count: monthlyMap[k] ?? 0,
    }));
    const topCidades = Object.entries(byCidade)
      .map(([cidade, count]) => ({ cidade, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json(
      {
        totalClients,
        countsByStatus,
        countsByTipo,
        byEstado,
        topCidades,
        monthlyNew,
        recent30d,
        prev30d,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erro ao gerar insights de clientes" },
      { status: 500 }
    );
  }
}
