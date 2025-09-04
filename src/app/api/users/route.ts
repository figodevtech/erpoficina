// app/api/users/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureAccess } from "./_authz";

/** Util: gera uma senha temporária segura */
function generateTempPassword() {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
    return (crypto as any).randomUUID().replace(/-/g, "").slice(0, 16);
  }
  // fallback
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

/** Carrega usuários + perfil + setor + permissões do perfil */
async function loadUsers() {
  // 1) usuários com perfil e setor “expandido”
  const { data: usuarios, error: uErr } = await supabaseAdmin
    .from("usuario")
    .select("id, nome, email, createdat, updatedat, perfil:perfilid(id,nome), setor:setorid(id,nome)")
    .order("createdat", { ascending: false });

  if (uErr) throw uErr;

  // 2) permissões por perfil
  const { data: perfilPerms, error: ppErr } = await supabaseAdmin
    .from("perfilpermissao")
    .select("perfilid, permissao:permissaoid(nome)");
  if (ppErr) throw ppErr;

  const permsByPerfil = new Map<number, string[]>();
  for (const row of perfilPerms ?? []) {
    const pid = row.perfilid as number;
    const nome = (row as any).permissao?.nome as string | undefined;
    if (!nome) continue;
    if (!permsByPerfil.has(pid)) permsByPerfil.set(pid, []);
    permsByPerfil.get(pid)!.push(nome);
  }

  // 3) monta saída expandida
  const out = (usuarios ?? []).map((u: any) => ({
    id: u.id as string,
    nome: u.nome as string,
    email: u.email as string,
    createdAt: u.createdat as string | null,
    updatedAt: u.updatedat as string | null,
    perfil: u.perfil ? { id: u.perfil.id as number, nome: u.perfil.nome as string } : null,
    setor: u.setor ? { id: u.setor.id as number, nome: u.setor.nome as string } : null,
    setorId: u.setor?.id as number | undefined,
    perfilId: u.perfil?.id as number | undefined,
    permissoes: u.perfil?.id ? (permsByPerfil.get(u.perfil.id) ?? []) : [],
  }));

  return out;
}

/**
 * GET /api/users
 * Lista usuários com perfil, setor e permissões herdadas do perfil.
 */
export async function GET() {
  const session = await auth();
  try {
    await ensureAccess(session);
    const users = await loadUsers();
    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Erro ao listar usuários" }, { status: 401 });
  }
}

/**
 * POST /api/users
 * Cria usuário no Auth e garante/atualiza o registro em public.usuario.
 * Body esperado:
 *   - nome: string
 *   - email: string
 *   - perfilId?: number      (recomendado)
 *   - perfilNome?: string    (alternativa; será resolvido para id)
 *   - setorId?: number
 */
export async function POST(req: Request) {
  const session = await auth();
  try {
    await ensureAccess(session);

    const body = await req.json();
    const {
      nome,
      email,
      perfilId,
      perfilNome,
      setorId,
    }: { nome: string; email: string; perfilId?: number; perfilNome?: string; setorId?: number } = body;

    if (!nome || !email) throw new Error("Nome e e-mail são obrigatórios");

    // Resolve perfilId (pelo nome, se necessário)
    let resolvedPerfilId = perfilId;
    if (!resolvedPerfilId && perfilNome) {
      const { data: p, error: pErr } = await supabaseAdmin.from("perfil").select("id").eq("nome", perfilNome).maybeSingle();
      if (pErr) throw pErr;
      if (!p?.id) throw new Error("Perfil não encontrado");
      resolvedPerfilId = p.id as number;
    }
    if (!resolvedPerfilId) throw new Error("Informe perfilId ou perfilNome");

    // 1) cria no Auth (dispara trigger para popular public.usuario)
    const tempPass = generateTempPassword();
    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPass,
      email_confirm: true,
      user_metadata: { nome, setorid: setorId ?? null, perfilid: resolvedPerfilId },
    });
    if (cErr || !created?.user) throw cErr ?? new Error("Falha ao criar usuário no Auth");
    const userId = created.user.id;

    // 2) upsert de segurança em public.usuario (caso trigger não rode por algum motivo)
    const { error: upErr } = await supabaseAdmin
      .from("usuario")
      .upsert(
        {
          id: userId,
          email,
          nome,
          setorid: typeof setorId === "number" ? setorId : null,
          perfilid: resolvedPerfilId,
          updatedat: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    if (upErr) throw upErr;

    // 3) retorna lista atualizada
    const users = await loadUsers();
    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Erro ao criar usuário" }, { status: 400 });
  }
}
