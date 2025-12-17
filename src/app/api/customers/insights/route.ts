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

const FORTALEZA_OFFSET = "-03:00";
const MS_DIA = 24 * 60 * 60 * 1000;

function localDayStartToUtcIso(dateStr: string) {
  return new Date(`${dateStr}T00:00:00${FORTALEZA_OFFSET}`).toISOString();
}

function localNextDayStartToUtcIso(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00${FORTALEZA_OFFSET}`);
  return new Date(d.getTime() + MS_DIA).toISOString();
}

function ym(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

// createdat vem em UTC; converte para data local fixa -03:00 e retorna YYYY-MM-DD
function localDateKeyFromIso(iso: string) {
  const utc = new Date(iso);
  const localMs = utc.getTime() - 3 * 60 * 60 * 1000;
  return new Date(localMs).toISOString().slice(0, 10);
}

function mesesEntre(inicioLocal: Date, fimLocal: Date) {
  const start = new Date(inicioLocal.getFullYear(), inicioLocal.getMonth(), 1);
  const end = new Date(fimLocal.getFullYear(), fimLocal.getMonth(), 1);

  const out: string[] = [];
  for (let d = new Date(start); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    out.push(ym(d));
  }
  return out;
}

function diasEntre(inicioLocal: Date, fimLocal: Date) {
  const start = new Date(inicioLocal.getFullYear(), inicioLocal.getMonth(), inicioLocal.getDate(), 0, 0, 0);
  const end = new Date(fimLocal.getFullYear(), fimLocal.getMonth(), fimLocal.getDate(), 0, 0, 0);

  const out: string[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += MS_DIA) {
    out.push(ymd(new Date(t)));
  }
  return out;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const monthsFallback = Math.min(Math.max(Number(url.searchParams.get("months") ?? 12), 1), 36);
    const dateFrom = url.searchParams.get("dateFrom"); // YYYY-MM-DD
    const dateTo = url.searchParams.get("dateTo"); // YYYY-MM-DD

    let query = supabaseAdmin.from("cliente").select("status, tipopessoa, estado, cidade, createdat");

    // filtros ANTES do returns()
    if (dateFrom) query = query.gte("createdat", localDayStartToUtcIso(dateFrom));
    if (dateTo) query = query.lt("createdat", localNextDayStartToUtcIso(dateTo));

    const { data, error } = await query.returns<Row[]>();
    if (error) throw error;

    const rows = data ?? [];
    const totalClients = rows.length;

    const countsByStatus: Record<string, number> = { ATIVO: 0, INATIVO: 0, PENDENTE: 0 };
    const countsByTipo = { FISICA: 0, JURIDICA: 0 } as Record<"FISICA" | "JURIDICA", number>;
    const byEstado: Record<string, number> = {};
    const byCidade: Record<string, number> = {};

    // âncora para comparativos 30d
    const fimRef = dateTo ? new Date(`${dateTo}T23:59:59${FORTALEZA_OFFSET}`) : new Date();

    const ms30 = 30 * MS_DIA;
    const startCurr = new Date(fimRef.getTime() - ms30);
    const startPrev = new Date(fimRef.getTime() - 2 * ms30);

    let recent30d = 0;
    let prev30d = 0;

    // ---- buckets mensais ----
    let monthsKeys: string[] = [];
    if (dateFrom && dateTo) {
      const iniLocal = new Date(`${dateFrom}T00:00:00${FORTALEZA_OFFSET}`);
      const fimLocal = new Date(`${dateTo}T23:59:59${FORTALEZA_OFFSET}`);
      monthsKeys = mesesEntre(iniLocal, fimLocal);
    } else {
      const start = new Date(fimRef.getFullYear(), fimRef.getMonth() - (monthsFallback - 1), 1);
      for (let i = 0; i < monthsFallback; i++) {
        const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
        monthsKeys.push(ym(d));
      }
    }

    const monthlyMap: Record<string, number> = Object.fromEntries(monthsKeys.map((k) => [k, 0]));

    // ---- buckets diários (somente quando houver filtro) ----
    let dailyNew: { date: string; count: number }[] | undefined;
    let dailyMap: Record<string, number> | undefined;
    let daysKeys: string[] | undefined;

    if (dateFrom && dateTo) {
      const iniLocal = new Date(`${dateFrom}T00:00:00${FORTALEZA_OFFSET}`);
      const fimLocal = new Date(`${dateTo}T23:59:59${FORTALEZA_OFFSET}`);
      daysKeys = diasEntre(iniLocal, fimLocal);
      dailyMap = Object.fromEntries(daysKeys.map((k) => [k, 0]));
    }

    for (const r of rows) {
      if (r.status && countsByStatus[r.status] !== undefined) countsByStatus[r.status]++;
      if (r.tipopessoa && countsByTipo[r.tipopessoa] !== undefined) countsByTipo[r.tipopessoa]++;

      const uf = (r.estado ?? "").toUpperCase();
      if (uf) byEstado[uf] = (byEstado[uf] ?? 0) + 1;

      const cid = (r.cidade ?? "").trim();
      if (cid) byCidade[cid] = (byCidade[cid] ?? 0) + 1;

      if (r.createdat) {
        const d = new Date(r.createdat);

        if (d >= startCurr) recent30d++;
        else if (d >= startPrev && d < startCurr) prev30d++;

        const keyMes = ym(d);
        if (monthlyMap[keyMes] !== undefined) monthlyMap[keyMes]++;

        if (dailyMap) {
          const keyDia = localDateKeyFromIso(r.createdat);
          if (dailyMap[keyDia] !== undefined) dailyMap[keyDia]++;
        }
      }
    }

    const monthlyNew = monthsKeys.map((k) => ({ month: k, count: monthlyMap[k] ?? 0 }));

    if (dailyMap && daysKeys) {
      dailyNew = daysKeys.map((k) => ({ date: k, count: dailyMap![k] ?? 0 }));
    }

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
        dailyNew,
        recent30d,
        prev30d,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro ao gerar insights de clientes" }, { status: 500 });
  }
}
