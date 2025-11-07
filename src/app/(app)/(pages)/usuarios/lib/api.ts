"use client";

export type Perfil = { id: number; nome: string };
export type Setor = { id: number; nome: string };
export type Usuario = {
  id: number | string;
  nome: string;
  email: string;
  perfilid?: number | null;
  setorid?: number | null;
  perfil?: Perfil | null;
  setor?: Setor | null;
};

export async function fetchLookup(): Promise<{ perfis: Perfil[]; setores: Setor[] }> {
  const r = await fetch("/api/users/lookup", { cache: "no-store" });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Falha ao carregar listas auxiliares");
  const perfis: Perfil[] = Array.isArray(j?.perfis) ? j.perfis : [];
  const setores: Setor[] = Array.isArray(j?.setores) ? j.setores : [];
  return { perfis, setores };
}

export async function fetchUsers(): Promise<Usuario[]> {
  const r = await fetch("/api/users", { cache: "no-store" });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Falha ao carregar usuários");
  const arr: any[] = Array.isArray(j?.users) ? j.users : [];
  // Normaliza campos comuns
  return arr.map((u) => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    perfilid: u.perfilid ?? u.perfilId ?? u?.perfil?.id ?? null,
    setorid: u.setorid ?? u.setorId ?? u?.setor?.id ?? null,
    perfil: u.perfil ?? null,
    setor: u.setor ?? null,
  })) as Usuario[];
}

export async function createUser(payload: {
  nome: string;
  email: string;
  perfilid?: number | null;
  perfilNome?: string; // compatível com seu backend
  setorid?: number | null;
}): Promise<void> {
  // O seu backend aceita perfilId OU perfilNome. Vamos enviar perfilId se existir.
  const body: any = {
    nome: payload.nome,
    email: payload.email,
  };
  if (payload.perfilid != null) body.perfilId = payload.perfilid;
  if (payload.perfilNome) body.perfilNome = payload.perfilNome;
  if (payload.setorid != null) body.setorId = payload.setorid;

  const r = await fetch("/api/users", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Erro ao criar usuário");
}

export async function updateUser(
  id: string | number,
  payload: {
    nome: string;
    email: string;
    perfilid?: number | null;
    perfilNome?: string;
    setorid?: number | null;
  }
): Promise<void> {
  const body: any = {
    nome: payload.nome,
    email: payload.email,
  };
  if (payload.perfilid != null) body.perfilId = payload.perfilid;
  if (payload.perfilNome) body.perfilNome = payload.perfilNome;
  if (payload.setorid != null) body.setorId = payload.setorid;

  const r = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Erro ao salvar usuário");
}

export async function deleteUser(id: string | number): Promise<void> {
  const r = await fetch(`/api/users/${id}`, { method: "DELETE" });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Erro ao remover usuário");
}
