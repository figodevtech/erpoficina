// app/api/_authz/perms.ts
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Mapa centralizado de permissões (mesmo nome que está no banco).
 * Mantemos tudo em CAIXA ALTA e tipado.
 */
export const PERMS = {
  DASHBOARD: "DASHBOARD_ACESSO",
  CLIENTES: "CLIENTES_ACESSO",
  ORDENS: "ORDENS_ACESSO",
  ESTOQUE: "ESTOQUE_ACESSO",
  FINANCEIRO: "FINANCEIRO_ACESSO",
  RELATORIOS: "RELATORIOS_ACESSO",

  
  CONFIG: "CONFIG_ACESSO",
  USUARIOS: "USUARIOS_ACESSO",

  ACOMPANHAMENTO: "ACOMPANHAMENTO_ACESSO",
  

} as const;

export type Permission = typeof PERMS[keyof typeof PERMS];

/**
 * Lê as permissões do usuário logado (por perfil) e retorna como Set em caixa alta.
 * Faz fallback por email se necessário.
 */
async function getUserPerms(): Promise<Set<string>> {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const uid = (session.user as any).id as string;
  const email = (session.user as any).email as string | undefined;

  // 1) tenta por id
  let perfilId: number | null = null;
  {
    const byId = await supabaseAdmin
      .from("usuario")
      .select("perfilid")
      .eq("id", uid)
      .maybeSingle();

    if (byId.data?.perfilid) {
      perfilId = Number(byId.data.perfilid);
    } else if (email) {
      // 2) fallback por email
      const byEmail = await supabaseAdmin
        .from("usuario")
        .select("perfilid")
        .eq("email", email)
        .maybeSingle();
      if (byEmail.data?.perfilid) perfilId = Number(byEmail.data.perfilid);
    }
  }

  if (!perfilId) return new Set<string>();

  const { data, error } = await supabaseAdmin
    .from("perfilpermissao")
    .select("permissao:permissaoid ( nome )")
    .eq("perfilid", perfilId);

  if (error) throw error;

  // normaliza para UPPERCASE e remove nulos/duplicados
  const list = (data ?? [])
    .map((r: any) => (r?.permissao?.nome ?? "").toString().trim().toUpperCase())
    .filter(Boolean);

  return new Set(list);
}

/* -------------------- Funções genéricas -------------------- */

export async function hasPerm(perm: Permission): Promise<boolean> {
  const perms = await getUserPerms();
  return perms.has(String(perm).toUpperCase());
}

export async function requirePerm(perm: Permission) {
  const ok = await hasPerm(perm);
  if (!ok) {
    const err = new Error(`Permissão negada (requer ${perm})`);
    (err as any).statusCode = 403;
    throw err;
  }
}

export async function hasAny(permsToCheck: Permission[]): Promise<boolean> {
  const perms = await getUserPerms();
  return permsToCheck.some((p) => perms.has(String(p).toUpperCase()));
}

export async function requireAny(permsToCheck: Permission[]) {
  const ok = await hasAny(permsToCheck);
  if (!ok) {
    const err = new Error(`Permissão negada (requer uma de: ${permsToCheck.join(", ")})`);
    (err as any).statusCode = 403;
    throw err;
  }
}

export async function hasAll(permsToCheck: Permission[]): Promise<boolean> {
  const perms = await getUserPerms();
  return permsToCheck.every((p) => perms.has(String(p).toUpperCase()));
}

export async function requireAll(permsToCheck: Permission[]) {
  const ok = await hasAll(permsToCheck);
  if (!ok) {
    const err = new Error(`Permissão negada (requer todas: ${permsToCheck.join(", ")})`);
    (err as any).statusCode = 403;
    throw err;
  }
}

/* -------------------- Atalhos por área (conveniência) -------------------- */
// Ordens
export async function hasOSAccess() {
  return hasPerm(PERMS.ORDENS);
}
export async function requireOSAccess() {
  return requirePerm(PERMS.ORDENS);
}

// Dashboard
export async function hasDashboardAccess() {
  return hasPerm(PERMS.DASHBOARD);
}
export async function requireDashboardAccess() {
  return requirePerm(PERMS.DASHBOARD);
}

// Clientes
export async function hasClientesAccess() {
  return hasPerm(PERMS.CLIENTES);
}
export async function requireClientesAccess() {
  return requirePerm(PERMS.CLIENTES);
}

// Usuários
export async function hasUsuariosAccess() {
  return hasPerm(PERMS.USUARIOS);
}
export async function requireUsuariosAccess() {
  return requirePerm(PERMS.USUARIOS);
}

// Config
export async function hasConfigAccess() {
  return hasPerm(PERMS.CONFIG);
}
export async function requireConfigAccess() {
  return requirePerm(PERMS.CONFIG);
}

// Estoque
export async function hasEstoqueAccess() {
  return hasPerm(PERMS.ESTOQUE);
}
export async function requireEstoqueAccess() {
  return requirePerm(PERMS.ESTOQUE);
}

// Acompanhamento
export async function hasAcompanhamentoAccess() {
  return hasPerm(PERMS.ACOMPANHAMENTO);
}
export async function requireAcompanhamentoAccess() {
  return requirePerm(PERMS.ACOMPANHAMENTO);
}

// Relatórios
export async function hasRelatoriosAccess() {
  return hasPerm(PERMS.RELATORIOS);
}
export async function requireRelatoriosAccess() {
  return requirePerm(PERMS.RELATORIOS);
}

export async function hasFinanceiroAccess() {
  return hasPerm(PERMS.FINANCEIRO);
}
export async function requireFinanceirosAccess() {
  return requirePerm(PERMS.FINANCEIRO);
}