// src/app/api/ordens/insights/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/** Ajuste aqui se quiser considerar somente status específicos como "concluída".
 *  Por padrão, consideramos 'concluída' quando datasaida != null. */
const COMPLETED_BY_STATUS: string[] | null = ["CONCLUIDO"];

type Row = {
  id: number;
  status: string | null;
  statusaprovacao: string | null;
  prioridade: string | null;
  dataentrada: string | null;
  datasaida: string | null;
  orcamentototal: string | number | null;
  clienteid: number | null;
  setorid: number | null;
};

function toNum(n: any) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}
const MS_PER_HOUR = 1000 * 60 * 60;
const todayISO = () => new Date().toISOString().slice(0, 10);

function ymKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** ==== Helpers de data (mesmo padrão do financeiro) ==== */
const FORTALEZA_OFFSET = "-03:00";

function localDayStartToUtcIso(dateStr: string) {
  return new Date(`${dateStr}T00:00:00${FORTALEZA_OFFSET}`).toISOString();
}

function localNextDayStartToUtcIso(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00${FORTALEZA_OFFSET}`);
  return new Date(d.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

/** ========================= GET ========================= */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const months = Math.min(Math.max(Number(url.searchParams.get("months") ?? 12), 1), 36);

    const dateFrom = url.searchParams.get("dateFrom"); // YYYY-MM-DD
    const dateTo = url.searchParams.get("dateTo"); // YYYY-MM-DD

    // base da query
    let query = supabaseAdmin
      .from("ordemservico")
      .select("id, status, statusaprovacao, prioridade, dataentrada, datasaida, orcamentototal, clienteid, setorid");

    // intervalo de datas (inclusive) em timezone Fortaleza
    if (dateFrom) {
      query = query.gte("dataentrada", localDayStartToUtcIso(dateFrom));
    }
    if (dateTo) {
      query = query.lt("dataentrada", localNextDayStartToUtcIso(dateTo));
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = ((data ?? []) as Row[]).filter((r) => r.dataentrada);
    const totalOrders = rows.length;

    const now = new Date();
    const ms30 = 30 * 24 * 60 * 60 * 1000;
    const start30 = new Date(now.getTime() - ms30);

    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    const monthKeys: string[] = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      monthKeys.push(ymKey(d));
    }

    const monthlyNew: Record<string, number> = Object.fromEntries(monthKeys.map((k) => [k, 0]));
    const monthlyCompleted: Record<string, number> = Object.fromEntries(monthKeys.map((k) => [k, 0]));
    const monthlyRevenue: Record<string, number> = Object.fromEntries(monthKeys.map((k) => [k, 0]));

    const last7: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      last7.push(dateKey(d));
    }
    const daily7: Record<string, number> = Object.fromEntries(last7.map((d) => [d, 0]));

    const countsByStatus: Record<string, number> = {};
    const countsByApproval: Record<string, number> = {};
    const countsByPriority: Record<string, number> = {};

    let ordersOpen = 0;
    let ordersCompleted = 0;

    let totalBudget = 0;
    let revenue30d = 0;
    let revenueToday = 0;
    let ordersToday = 0;
    let ordersTodayCompleted = 0;

    const durationsHours: number[] = [];
    const today = todayISO();

    const isCompleted = (r: Row) => {
      const hasExitDate = !!r.datasaida;
      if (COMPLETED_BY_STATUS && COMPLETED_BY_STATUS.length > 0) {
        return hasExitDate || (r.status && COMPLETED_BY_STATUS.includes(r.status));
      }
      return hasExitDate;
    };

    for (const r of rows) {
      const ve = r.dataentrada ? new Date(r.dataentrada) : null;
      const vs = r.datasaida ? new Date(r.datasaida) : null;
      const budget = toNum(r.orcamentototal);

      totalBudget += budget;

      const st = String(r.status ?? "NULL");
      countsByStatus[st] = (countsByStatus[st] ?? 0) + 1;

      const ap = String(r.statusaprovacao ?? "NULL");
      countsByApproval[ap] = (countsByApproval[ap] ?? 0) + 1;

      const pr = String(r.prioridade ?? "NULL");
      countsByPriority[pr] = (countsByPriority[pr] ?? 0) + 1;

      if (isCompleted(r)) {
        ordersCompleted += 1;
      } else {
        ordersOpen += 1;
      }

      if (ve) {
        const key = ymKey(new Date(ve.getFullYear(), ve.getMonth(), 1));
        if (monthlyNew[key] !== undefined) monthlyNew[key] += 1;

        const dk = dateKey(ve);
        if (daily7[dk] !== undefined) daily7[dk] += 1;

        if (dk === today) ordersToday += 1;
      }

      if (isCompleted(r) && vs) {
        const key2 = ymKey(new Date(vs.getFullYear(), vs.getMonth(), 1));
        if (monthlyCompleted[key2] !== undefined) monthlyCompleted[key2] += 1;
        if (monthlyRevenue[key2] !== undefined) monthlyRevenue[key2] += budget;

        const dk2 = dateKey(vs);
        if (dk2 === today) {
          ordersTodayCompleted += 1;
          revenueToday += budget;
        }
        if (vs >= start30) revenue30d += budget;

        if (ve) {
          const hrs = (vs.getTime() - ve.getTime()) / MS_PER_HOUR;
          if (Number.isFinite(hrs) && hrs >= 0) durationsHours.push(hrs);
        }
      }
    }

    durationsHours.sort((a, b) => a - b);
    const avgCompletionHours = durationsHours.length
      ? durationsHours.reduce((a, b) => a + b, 0) / durationsHours.length
      : 0;
    const p50CompletionHours = durationsHours.length
      ? durationsHours[Math.floor((durationsHours.length - 1) * 0.5)]
      : 0;
    const p90CompletionHours = durationsHours.length
      ? durationsHours[Math.floor((durationsHours.length - 1) * 0.9)]
      : 0;

    const avgTicketAll = totalOrders ? totalBudget / totalOrders : 0;

    const monthlyNewArr = monthKeys.map((k) => ({
      month: k,
      count: monthlyNew[k] ?? 0,
    }));
    const monthlyCompletedArr = monthKeys.map((k) => ({
      month: k,
      count: monthlyCompleted[k] ?? 0,
    }));
    const monthlyRevenueArr = monthKeys.map((k) => ({
      month: k,
      amount: monthlyRevenue[k] ?? 0,
    }));
    const last7DaysNewArr = last7.map((d) => ({
      date: d,
      count: daily7[d] ?? 0,
    }));

    /** ==== Ranking de serviços por usuário (OS concluídas no período) ==== */
    const completedOsIds = rows
      .filter((r) => isCompleted(r)) // status concluído + datasaida
      .map((r) => r.id)
      .filter((id) => id != null) as number[];

    type RankRow = {
      idusuariorealizador: string | null;
      usuario: {
        id: string;
        nome: string;
        email: string;
      } | null;
    };

    let servicesByUser: {
      usuarioId: string;
      usuarioNome: string;
      usuarioEmail: string;
      totalServicos: number;
    }[] = [];

    if (completedOsIds.length > 0) {
      const { data: rankData, error: rankError } = await supabaseAdmin
        .from("osservico")
        .select(
          `
      idusuariorealizador,
      usuario:usuario!osservico_idusuariorealizador_fkey ( id, nome, email )
      `
        )
        .in("ordemservicoid", completedOsIds);

      if (rankError) throw rankError;

      const map = new Map<string, { id: string; nome: string; email: string; total: number }>();

      for (const raw of rankData ?? []) {
        const row = raw as any;

        // Supabase pode retornar usuario como objeto único ou array
        const u = Array.isArray(row.usuario) ? row.usuario[0] : row.usuario;
        if (!u) continue;

        const email = (u.email as string | undefined)?.toLowerCase().trim();
        if (!email) continue;

        const atual = map.get(email) ?? {
          id: String(u.id),
          nome: (u.nome as string | undefined)?.trim() || "Usuário sem nome",
          email: u.email as string,
          total: 0,
        };

        atual.total += 1; // cada linha de osservico = 1 serviço
        map.set(email, atual);
      }

      servicesByUser = Array.from(map.values())
        .map((u) => ({
          usuarioId: u.id,
          usuarioNome: u.nome,
          usuarioEmail: u.email,
          totalServicos: u.total,
        }))
        .sort((a, b) => b.totalServicos - a.totalServicos)
        .slice(0, 10);
    }

    return NextResponse.json(
      {
        totalOrders,
        ordersOpen,
        ordersCompleted,
        totalBudget,
        avgTicketAll,
        avgCompletionHours,
        p50CompletionHours,
        p90CompletionHours,
        ordersToday,
        ordersTodayCompleted,
        revenueToday,
        revenue30d,
        countsByStatus,
        countsByApproval,
        countsByPriority,
        monthlyNew: monthlyNewArr,
        monthlyCompleted: monthlyCompletedArr,
        monthlyRevenue: monthlyRevenueArr,
        last7DaysNew: last7DaysNewArr,
        servicesByUser,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro ao gerar insights de ordens de serviço" }, { status: 500 });
  }
}
