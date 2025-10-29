"use client";

import { useEffect, useState } from "react";
import type { StatusOS } from "./ordens-tabs";

// Cores dos status (mantive seu padrão e ajustei APROVADO p/ consistência)
export const statusClasses: Record<string, string> = {
  ORCAMENTO: "bg-fuchsia-600/15 text-fuchsia-400",
  APROVACAO_ORCAMENTO: "bg-sky-600/15 text-sky-400",
  ORCAMENTO_APROVADO: "bg-emerald-600/15 text-emerald-400",
  EM_ANDAMENTO: "bg-amber-600/15 text-amber-400",
  PAGAMENTO: "bg-indigo-600/15 text-indigo-400",
  CONCLUIDO: "bg-green-600/15 text-green-400",
  CANCELADO: "bg-red-600/15 text-red-400",
};

// Cores de prioridade
export const prioClasses: Record<string, string> = {
  ALTA: "bg-red-600/15 text-red-500",
  NORMAL: "bg-amber-600/15 text-amber-500",
  BAIXA: "bg-emerald-600/15 text-emerald-500",
};

export function fmtDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function toMs(s?: string | null): number | null {
  if (!s) return null;
  const t = new Date(s).getTime();
  return isNaN(t) ? null : t;
}

export function fmtDuration(ms: number) {
  if (ms < 0) ms = 0;
  const m = Math.floor(ms / 60000);
  if (m <= 0) return "agora";
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const min = m % 60;
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  parts.push(`${min}m`);
  return parts.join(" ");
}

export function useNowTick(periodMs = 60000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), periodMs);
    return () => clearInterval(id);
  }, [periodMs]);
  return now;
}

export function safeStatus(s?: string | null) {
  return (s ?? "ORCAMENTO") as Exclude<StatusOS, "TODAS">;
}
