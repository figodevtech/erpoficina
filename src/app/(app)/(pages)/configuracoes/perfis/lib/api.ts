export const runtime = "nodejs";

import type { Perfil, Permissao } from "../types";

function erroPadrao(r: Response, j: any) {
  const msg = j?.error || `Falha na requisição (${r.status})`;
  return new Error(msg);
}

/**
 * GET /api/perfis -> { perfis, permissoes }
 * (compatível também com { perfis, permissoesDisponiveis })
 */
export async function listarPerfisEPermissoes(): Promise<{ perfis: Perfil[]; permissoes: Permissao[] }> {
  const r = await fetch("/api/perfis", { cache: "no-store" });
  const j = await r.json().catch(() => ({}));

  if (!r.ok) throw erroPadrao(r, j);

  return {
    perfis: (j?.perfis ?? []) as Perfil[],
    permissoes: ((j?.permissoes ?? j?.permissoesDisponiveis) ?? []) as Permissao[],
  };
}

export async function listarPerfis(): Promise<Perfil[]> {
  const { perfis } = await listarPerfisEPermissoes();
  return perfis;
}

export async function listarPermissoes(): Promise<Permissao[]> {
  const { permissoes } = await listarPerfisEPermissoes();
  return permissoes;
}

export async function buscarPerfil(id: number): Promise<Perfil> {
  const r = await fetch(`/api/perfis/${id}`, { cache: "no-store" });
  const j = await r.json().catch(() => ({}));

  if (!r.ok) throw erroPadrao(r, j);

  return j?.perfil as Perfil;
}

export async function criarPerfil(payload: { nome: string; descricao: string; permissoesIds: number[] }) {
  const r = await fetch("/api/perfis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw erroPadrao(r, j);

  return j?.perfil as Perfil;
}

export async function atualizarPerfil(id: number, payload: { nome: string; descricao: string; permissoesIds: number[] }) {
  const r = await fetch(`/api/perfis/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw erroPadrao(r, j);

  return j?.perfil as Perfil;
}
