// app/api/users/_authz.ts
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function ensureAccess(session?: any) {
  // MODO LIVRE: não valida nada.
  if (process.env.OPEN_PERMISSIONS === "true") return;

  if (!session?.user) throw new Error("Não autenticado");

  const directId = (session.user as any)?.id as string | undefined;
  const email = (session.user?.email as string | undefined) ?? null;
  let uid = directId;

  if (!uid && email) {
    const { data, error } = await supabaseAdmin
      .from("usuario")
      .select("id")
      .eq("email", email)
      .single();
    if (error || !data) throw new Error("Usuário não encontrado");
    uid = data.id as string;
  }
  if (!uid) throw new Error("Usuário sem identificador");

  const { data: me, error: meErr } = await supabaseAdmin
    .from("usuario")
    .select("perfilid")
    .eq("id", uid)
    .single();
  if (meErr || !me) throw new Error("Perfil não encontrado");

  const { data: perm, error: pErr } = await supabaseAdmin
    .from("permissao")
    .select("id")
    .eq("nome", "USUARIOS_GERENCIAR")
    .maybeSingle();
  if (pErr) throw pErr;
  if (!perm?.id) throw new Error("Permissão USUARIOS_GERENCIAR não cadastrada");

  const { data: link, error: lErr } = await supabaseAdmin
    .from("perfilpermissao")
    .select("perfilid")
    .eq("perfilid", me.perfilid)
    .eq("permissaoid", perm.id)
    .maybeSingle();
  if (lErr) throw lErr;
  if (!link) throw new Error("Sem permissão para gerenciar usuários");
}
