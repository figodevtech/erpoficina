// app/api/_authz/perms.ts
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const OS_PERM = "ORDENS_ACESSO";

async function getUserPerms(): Promise<string[]> {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const uid = (session.user as any).id as string;
  const email = (session.user as any).email as string | undefined;

  let perfilId: number | null = null;

  const byId = await supabaseAdmin
    .from("usuario")
    .select("perfilid")
    .eq("id", uid)
    .maybeSingle();

  if (byId.data?.perfilid) {
    perfilId = Number(byId.data.perfilid);
  } else if (email) {
    const byEmail = await supabaseAdmin
      .from("usuario")
      .select("perfilid")
      .eq("email", email)
      .maybeSingle();
    if (byEmail.data?.perfilid) perfilId = Number(byEmail.data.perfilid);
  }

  if (!perfilId) return [];

  const { data, error } = await supabaseAdmin
    .from("perfilpermissao")
    .select("permissao:permissaoid ( nome )")
    .eq("perfilid", perfilId);

  if (error) throw error;

  return Array.from(
    new Set(
      (data ?? [])
        .map((r: any) => r.permissao?.nome)
        .filter(Boolean)
        .map((n: string) => n.toUpperCase())
    )
  );
}

export async function requireOSAccess() {
  const perms = await getUserPerms();
  if (!perms.includes(OS_PERM)) {
    const err = new Error("Permissão negada (requer ORDENS_ACESSO)");
    (err as any).statusCode = 403;
    throw err;
  }
}

export async function hasOSAccess(): Promise<boolean> {
  try {
    const perms = await getUserPerms();
    return perms.includes(OS_PERM);
  } catch {
    return false;
  }
}
