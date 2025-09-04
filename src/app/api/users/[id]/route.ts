// app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureAccess } from "../_authz";

/**
 * Atualiza:
 *  - email no Auth (se enviado)
 *  - public.usuario (nome, email, setorid, perfilid)
 *  - permissões do PERFIL (se 'permissoes' for enviado)
 *
 * Body aceito (todos opcionais):
 *  {
 *    nome?: string;
 *    email?: string;
 *    perfilId?: number;
 *    perfilNome?: string;   // alternativa para resolver perfilId
 *    setorId?: number;
 *    permissoes?: string[]; // nomes do enum (USUARIOS_GERENCIAR, etc.)
 *  }
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
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
      permissoes,
    }: {
      nome?: string;
      email?: string;
      perfilId?: number;
      perfilNome?: string;
      setorId?: number;
      permissoes?: string[];
    } = body ?? {};

    const userId = params.id;

    // --- Atualiza e-mail no Auth (se enviado) ---
    if (email) {
      const { error: upErr } = await supabaseAdmin.auth.admin.updateUserById(userId, { email });
      if (upErr) throw upErr;
    }

    // --- Resolver perfilId alvo ---
    let newPerfilId = perfilId;
    if (!newPerfilId && perfilNome) {
      const { data: p, error: pErr } = await supabaseAdmin
        .from("perfil")
        .select("id")
        .eq("nome", perfilNome)
        .maybeSingle();
      if (pErr) throw pErr;
      if (!p?.id) throw new Error("Perfil não encontrado");
      newPerfilId = p.id as number;
    }

    // Caso precise apenas mudar permissões do perfil atual (sem enviar perfilId),
    // precisamos conhecer o perfilid atual do usuário.
    let currentPerfilId: number | null = null;
    if (!newPerfilId || Array.isArray(permissoes)) {
      const { data: u, error: uErr } = await supabaseAdmin
        .from("usuario")
        .select("perfilid")
        .eq("id", userId)
        .maybeSingle();
      if (uErr) throw uErr;
      currentPerfilId = (u?.perfilid as number | null) ?? null;
    }

    // --- Atualiza public.usuario (se houver algo a mudar) ---
    const updatePayload: Record<string, any> = {};
    if (typeof nome !== "undefined") updatePayload.nome = nome;
    if (typeof email !== "undefined") updatePayload.email = email;
    if (typeof setorId !== "undefined") updatePayload.setorid = setorId;
    if (typeof newPerfilId !== "undefined") updatePayload.perfilid = newPerfilId;

    if (Object.keys(updatePayload).length > 0) {
      const { error: u2Err } = await supabaseAdmin
        .from("usuario")
        .update({ ...updatePayload, updatedat: new Date().toISOString() })
        .eq("id", userId);
      if (u2Err) throw u2Err;
    }

    // --- Ajusta permissões do PERFIL, se solicitado ---
    if (Array.isArray(permissoes)) {
      // perfil a aplicar: o novo (se enviado) senão o atual
      const targetPerfilId = typeof newPerfilId !== "undefined" ? newPerfilId : currentPerfilId;
      if (!targetPerfilId) throw new Error("Sem perfil para aplicar permissões");

      // catálogo de permissões (id por nome)
      const { data: allPerms, error: pAllErr } = await supabaseAdmin
        .from("permissao")
        .select("id, nome");
      if (pAllErr) throw pAllErr;

      const byName = new Map<string, number>(
        (allPerms ?? []).map((p) => [String(p.nome), Number(p.id)])
      );

      // permissões atuais do perfil
      const { data: atuaisRows, error: atErr } = await supabaseAdmin
        .from("perfilpermissao")
        .select("permissaoid")
        .eq("perfilid", targetPerfilId);
      if (atErr) throw atErr;

      const atuais = new Set<number>((atuaisRows ?? []).map((r) => Number(r.permissaoid)));

      // desejadas por id
      const desejadas = new Set<number>();
      for (const nomePerm of permissoes) {
        const pid = byName.get(nomePerm);
        if (pid) desejadas.add(pid);
      }

      // inserir novas
      const toInsert = [...desejadas]
        .filter((id) => !atuais.has(id))
        .map((id) => ({ perfilid: targetPerfilId, permissaoid: id }));
      if (toInsert.length) {
        const { error: insErr } = await supabaseAdmin.from("perfilpermissao").insert(toInsert);
        if (insErr) throw insErr;
      }

      // remover que não estão mais desejadas
      const toDelete = [...atuais].filter((id) => !desejadas.has(id));
      if (toDelete.length) {
        const { error: delErr } = await supabaseAdmin
          .from("perfilpermissao")
          .delete()
          .eq("perfilid", targetPerfilId)
          .in("permissaoid", toDelete);
        if (delErr) throw delErr;
      }
    }

    // --- Retorna lista atualizada ---
    const list = await import("../route");
    return list.GET();
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Erro ao atualizar usuário" }, { status: 400 });
  }
}

/**
 * Remove usuário:
 *  - Deleta do Auth (e por FK ON DELETE CASCADE, remove de public.usuario)
 *  - Caso a FK não esteja com CASCADE, tenta remover de public.usuario também.
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  try {
    await ensureAccess(session);

    const userId = params.id;

    // Deleta no Auth
    const { error: dErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (dErr) throw dErr;

    // Fallback: remover da tabela caso a FK não seja CASCADE
    await supabaseAdmin.from("usuario").delete().eq("id", userId);

    // Retorna lista atualizada
    const list = await import("../route");
    return list.GET();
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Erro ao remover usuário" }, { status: 400 });
  }
}
