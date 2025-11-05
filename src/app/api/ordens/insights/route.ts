export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/** Ajuste aqui se quiser considerar somente status específicos como "concluída".
 *  Por padrão, consideramos 'concluída' quando datasaida != null. */
const COMPLETED_BY_STATUS: string[] | null = null; // ex.: ["FINALIZADA", "ENTREGUE"]

type Row = {
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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const months = Math.min(Math.max(Number(url.searchParams.get("months") ?? 12), 1), 36);

    // Buscar só as colunas necessárias
    const { data, error } = await supabaseAdmin
      .from("ordemservico")
      .select("status, statusaprovacao, prioridade, dataentrada, datasaida, orcamentototal, clienteid, setorid")
      .returns<Row[]>();

    if (error) throw error;

    const rows = (data ?? []).filter((r) => r.dataentrada); // precisamos ao menos da data de entrada
    const totalOrders = rows.length;

    // Janelas de tempo
    const now = new Date();
    const ms30 = 30 * 24 * 60 * 60 * 1000;
    const start30 = new Date(now.getTime() - ms30);

    // buckets mensais (últimos N meses, baseados no primeiro dia de cada mês)
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    const monthKeys: string[] = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      monthKeys.push(ymKey(d));
    }

    const monthlyNew: Record<string, number> = Object.fromEntries(monthKeys.map((k) => [k, 0]));
    const monthlyCompleted: Record<string, number> = Object.fromEntries(monthKeys.map((k) => [k, 0]));
    const monthlyRevenue: Record<string, number> = Object.fromEntries(monthKeys.map((k) => [k, 0]));

    // últimos 7 dias (por data de entrada)
    const last7: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      last7.push(dateKey(d));
    }
    const daily7: Record<string, number> = Object.fromEntries(last7.map((d) => [d, 0]));

    // agregadores
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

    // helper: regra de "concluído"
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

      // Totais gerais
      totalBudget += budget;

      // Status / aprovação / prioridade
      const st = String(r.status ?? "NULL");
      countsByStatus[st] = (countsByStatus[st] ?? 0) + 1;

      const ap = String(r.statusaprovacao ?? "NULL");
      countsByApproval[ap] = (countsByApproval[ap] ?? 0) + 1;

      const pr = String(r.prioridade ?? "NULL");
      countsByPriority[pr] = (countsByPriority[pr] ?? 0) + 1;

      // Abertas vs concluídas
      if (isCompleted(r)) {
        ordersCompleted += 1;
      } else {
        ordersOpen += 1;
      }

      // "Novas" por mês (dataentrada)
      if (ve) {
        const key = ymKey(new Date(ve.getFullYear(), ve.getMonth(), 1));
        if (monthlyNew[key] !== undefined) monthlyNew[key] += 1;

        const dk = dateKey(ve);
        if (daily7[dk] !== undefined) daily7[dk] += 1;

        if (dk === today) ordersToday += 1;
      }

      // "Concluídas" + receita por mês (datasaida)
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

        // duração
        if (ve) {
          const hrs = (vs.getTime() - ve.getTime()) / MS_PER_HOUR;
          if (Number.isFinite(hrs) && hrs >= 0) durationsHours.push(hrs);
        }
      }
    }

    // estatísticas de duração
    durationsHours.sort((a, b) => a - b);
    const avgCompletionHours =
      durationsHours.length ? durationsHours.reduce((a, b) => a + b, 0) / durationsHours.length : 0;
    const p50CompletionHours = durationsHours.length
      ? durationsHours[Math.floor((durationsHours.length - 1) * 0.5)]
      : 0;
    const p90CompletionHours = durationsHours.length
      ? durationsHours[Math.floor((durationsHours.length - 1) * 0.9)]
      : 0;

    const avgTicketAll = totalOrders ? totalBudget / totalOrders : 0;
    const avgTicketCompleted = ordersCompleted ? revenue30d /* not ideal */ : 0; // manteremos só avgTicketAll no front

    // serialização dos buckets
    const monthlyNewArr = monthKeys.map((k) => ({ month: k, count: monthlyNew[k] ?? 0 }));
    const monthlyCompletedArr = monthKeys.map((k) => ({ month: k, count: monthlyCompleted[k] ?? 0 }));
    const monthlyRevenueArr = monthKeys.map((k) => ({ month: k, amount: monthlyRevenue[k] ?? 0 }));
    const last7DaysNewArr = last7.map((d) => ({ date: d, count: daily7[d] ?? 0 }));

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
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erro ao gerar insights de ordens de serviço" },
      { status: 500 }
    );
  }
}
