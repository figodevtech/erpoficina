// app/api/users/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureAccess } from "../_authz";

function isOpen() {
  const v = (process.env.OPEN_PERMISSIONS ?? "").toString().trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = isOpen() ? null : await auth();
    await ensureAccess(session);

    const body = await req.json();
    const { nome, email, perfilId, perfilNome, setorId, permissoes }:
      { nome?: string; email?: string; perfilId?: number; perfilNome?: string; setorId?: number; permissoes?: string[] } = body ?? {};
    const userId = params.id;

    if (email) {
      const { error: upErr } = await supabaseAdmin.auth.admin.updateUserById(userId, { email });
      if (upErr) throw upErr;
    }

    let newPerfilId = perfilId;
    if (!newPerfilId && perfilNome) {
      const { data: p, error: perr } = await supabaseAdmin.from("perfil").select("id").eq("nome", perfilNome).maybeSingle();
      if (perr) throw perr;
      if (!p?.id) throw new Error("Perfil não encontrado");
      newPerfilId = p.id as number;
    }

    let currentPerfilId: number | null = null;
    if (!newPerfilId || Array.isArray(permissoes)) {
      const { data: u, error: uerr } = await supabaseAdmin.from("usuario").select("perfilid").eq("id", userId).maybeSingle();
      if (uerr) throw uerr;
      currentPerfilId = (u?.perfilid as number | null) ?? null;
    }

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

    if (Array.isArray(permissoes)) {
      const targetPerfilId = typeof newPerfilId !== "undefined" ? newPerfilId : currentPerfilId;
      if (!targetPerfilId) throw new Error("Sem perfil para aplicar permissões");

      const { data: allPerms, error: allErr } = await supabaseAdmin.from("permissao").select("id, nome");
      if (allErr) throw allErr;

      const byName = new Map<string, number>((allPerms ?? []).map((p) => [String(p.nome), Number(p.id)]));

      const { data: atuaisRows, error: atErr } = await supabaseAdmin
        .from("perfilpermissao")
        .select("permissaoid")
        .eq("perfilid", targetPerfilId);
      if (atErr) throw atErr;

      const atuais = new Set<number>((atuaisRows ?? []).map((r) => Number(r.permissaoid)));
      const desejadas = new Set<number>();
      for (const nomePerm of permissoes) {
        const pid = byName.get(nomePerm);
        if (pid) desejadas.add(pid);
      }

      const toInsert = [...desejadas].filter((id) => !atuais.has(id)).map((id) => ({ perfilid: targetPerfilId, permissaoid: id }));
      if (toInsert.length) {
        const { error: insErr } = await supabaseAdmin.from("perfilpermissao").insert(toInsert);
        if (insErr) throw insErr;
      }

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

    const list = await import("../route");
    return list.GET();
  } catch (e: any) {
    console.error("[/api/users/:id PUT] error:", e);
    const status = /não autenticado|unauth|auth/i.test(String(e?.message)) ? 401 : 500;
    return NextResponse.json({ error: e?.message ?? "Erro ao atualizar usuário" }, { status });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = isOpen() ? null : await auth();
    await ensureAccess(session);

    const userId = params.id;
    const { error: dErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (dErr) throw dErr;

    await supabaseAdmin.from("usuario").delete().eq("id", userId);

    const list = await import("../route");
    return list.GET();
  } catch (e: any) {
    console.error("[/api/users/:id DELETE] error:", e);
    const status = /não autenticado|unauth|auth/i.test(String(e?.message)) ? 401 : 500;
    return NextResponse.json({ error: e?.message ?? "Erro ao remover usuário" }, { status });
  }
}
