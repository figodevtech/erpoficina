// lib/api.ts
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
  ativo?: boolean;
};

export type UsuarioPayload = {
  nome: string;
  email: string;
  perfilid?: number | null;
  setorid?: number | null;
  ativo?: boolean;
};

// 🔹 Busca perfis e setores para o cadastro de usuários
export async function buscarListasUsuarios(): Promise<{
  perfis: Perfil[];
  setores: Setor[];
}> {
  const r = await fetch("/api/users/lookup", { cache: "no-store" });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Falha ao carregar listas auxiliares");
  const perfis: Perfil[] = Array.isArray(j?.perfis) ? j.perfis : [];
  const setores: Setor[] = Array.isArray(j?.setores) ? j.setores : [];
  return { perfis, setores };
}

// 🔹 Lista usuários
export async function buscarUsuarios(): Promise<Usuario[]> {
  const r = await fetch("/api/users", { cache: "no-store" });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Falha ao carregar usuários");
  const arr: any[] = Array.isArray(j?.users) ? j.users : [];

  return arr.map((u) => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    perfilid: u.perfilid ?? u.perfilId ?? u?.perfil?.id ?? null,
    setorid: u.setorid ?? u.setorId ?? u?.setor?.id ?? null,
    perfil: u.perfil ?? null,
    setor: u.setor ?? null,
    ativo: typeof u.ativo === "boolean" ? u.ativo : true,
  })) as Usuario[];
}

// 🔹 Cria usuário
export async function criarUsuario(payload: UsuarioPayload) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: payload.nome,
      email: payload.email,
      perfilid: payload.perfilid ?? null,
      setorid: payload.setorid ?? null,
      ativo: payload.ativo,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Erro ao criar usuário");
  return data.users; // backend devolve lista atualizada (mas o caller não precisa usar)
}

// 🔹 Atualiza usuário
export async function atualizarUsuario(id: string | number, payload: UsuarioPayload) {
  const res = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: payload.nome,
      email: payload.email,
      perfilId: payload.perfilid ?? null,
      setorId: payload.setorid ?? null,
      ativo: payload.ativo,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Erro ao atualizar usuário");
  return data.users;
}

// 🔹 Exclui usuário
export async function excluirUsuario(id: string | number): Promise<void> {
  const r = await fetch(`/api/users/${id}`, { method: "DELETE" });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Erro ao remover usuário");
}

// 🔹 Enviar convite (e-mail de definição/redefinição de senha)
export async function enviarConviteUsuario(id: string | number): Promise<void> {
  const res = await fetch(`/api/users/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ acao: "convite" }), // 👈 PT-BR
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Erro ao enviar convite");
}

// 🔹 Definir diretamente a senha do usuário
export async function definirSenhaUsuario(id: string | number, senha: string): Promise<void> {
  const res = await fetch(`/api/users/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ acao: "definir_senha", senha }), // 👈 PT-BR
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Erro ao definir senha do usuário");
}
