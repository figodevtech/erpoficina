import { DetalheOS, RowOS, StatusOS } from "../types";

const JSONH = { "Content-Type": "application/json" };

export async function listarOrdensEquipe(params: {
  status: StatusOS;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: RowOS[]; total: number; totalPages: number }> {
  const url = new URL("/api/equipes/ordens", window.location.origin);
  url.searchParams.set("status", params.status);
  if (params.q) url.searchParams.set("q", params.q);
  url.searchParams.set("page", String(params.page ?? 1));
  url.searchParams.set("limit", String(params.limit ?? 10));

  const r = await fetch(url.toString(), { cache: "no-store" });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Falha ao carregar ordens da equipe");
  return { items: j.items ?? [], total: j.total ?? 0, totalPages: j.totalPages ?? 1 };
}

export async function assumirOS(id: number): Promise<void> {
  const r = await fetch(`/api/ordens/${id}/assumir`, { method: "POST", headers: JSONH });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Falha ao assumir OS");
}

export async function obterDetalhesOS(id: number): Promise<DetalheOS> {
  const r = await fetch(`/api/ordens/${id}/detalhes`, { cache: "no-store" });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Falha ao carregar detalhes da OS");
  return j as DetalheOS;
}
