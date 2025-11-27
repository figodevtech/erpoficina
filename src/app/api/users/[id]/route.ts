// app/api/users/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureAccess } from "../_authz";

function isOpen() {
  const v = (process.env.OPEN_PERMISSIONS ?? "")
    .toString()
    .trim()
    .toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

/**
 * POST /api/users/[id]
 * body: { acao?: "convite" | "definir_senha"; senha?: string }
 *
 * - acao "convite"       → envia e-mail de redefinição/primeiro acesso
 * - acao "definir_senha" → define a senha diretamente no Auth
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = isOpen() ? null : await auth();
    await ensureAccess(session);

    const { id: userId } = await context.params;

    const body = (await req.json().catch(() => ({}))) as {
      acao?: string;
      senha?: string;
    };

    // normaliza + aceita sinônimos antigos ("invite", "set_password")
    const rawAcao = (body.acao ?? "convite").toString().toLowerCase().trim();

    let acao: "convite" | "definir_senha";
    if (rawAcao === "convite" || rawAcao === "invite") {
      acao = "convite";
    } else if (
      rawAcao === "definir_senha" ||
      rawAcao === "set_password"
    ) {
      acao = "definir_senha";
    } else {
      return NextResponse.json(
        { error: "Ação inválida." },
        { status: 400 }
      );
    }

    // Carrega usuário na tabela "usuario" para obter email e nome
    const { data: usuario, error: uErr } = await supabaseAdmin
      .from("usuario")
      .select("id, email, nome")
      .eq("id", userId)
      .maybeSingle();

    if (uErr) throw uErr;
    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    if (!usuario.email) {
      return NextResponse.json(
        { error: "Usuário não possui e-mail cadastrado." },
        { status: 400 }
      );
    }

    // 1) ENVIAR CONVITE (e-mail de redefinição / primeiro acesso)
    if (acao === "convite") {
      const redirectTo =
        process.env.SUPABASE_RESET_REDIRECT_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        undefined;

      const { error: mailErr } =
        await supabaseAdmin.auth.resetPasswordForEmail(usuario.email, {
          redirectTo,
        });

      if (mailErr) throw mailErr;

      return NextResponse.json(
        {
          ok: true,
          acao: "convite",
          message: "Convite enviado (e-mail de definição de senha).",
        },
        { status: 200 }
      );
    }

    // 2) DEFINIR SENHA DIRETAMENTE
    if (acao === "definir_senha") {
      const senha = (body.senha || "").trim();

      if (!senha || senha.length < 6) {
        return NextResponse.json(
          {
            error:
              "Informe uma senha com pelo menos 6 caracteres para definir a senha.",
          },
          { status: 400 }
        );
      }

      const { error: upErr } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: senha }
      );
      if (upErr) throw upErr;

      return NextResponse.json(
        {
          ok: true,
          acao: "definir_senha",
          message: "Senha do usuário atualizada com sucesso.",
        },
        { status: 200 }
      );
    }

    // fallback (não deveria chegar aqui)
    return NextResponse.json(
      { error: "Ação inválida." },
      { status: 400 }
    );
  } catch (e: any) {
    console.error("[/api/users/:id POST] error:", e);
    const status = /não autenticado|unauth|auth/i.test(String(e?.message))
      ? 401
      : 500;
    return NextResponse.json(
      { error: e?.message ?? "Erro ao processar ação do usuário" },
      { status }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = isOpen() ? null : await auth();
    await ensureAccess(session);

    const { id: userId } = await context.params;

    const body = await req.json();
    const {
      nome,
      email,
      perfilId,
      perfilNome,
      setorId,
      permissoes,
      ativo,
    }: {
      nome?: string;
      email?: string;
      perfilId?: number;
      perfilNome?: string;
      setorId?: number;
      permissoes?: string[];
      ativo?: boolean;
    } = body ?? {};

    if (email) {
      const { error: upErr } =
        await supabaseAdmin.auth.admin.updateUserById(userId, { email });
      if (upErr) throw upErr;
    }

    let newPerfilId = perfilId;
    if (!newPerfilId && perfilNome) {
      const { data: p, error: perr } = await supabaseAdmin
        .from("perfil")
        .select("id")
        .eq("nome", perfilNome)
        .maybeSingle();
      if (perr) throw perr;
      if (!p?.id) throw new Error("Perfil não encontrado");
      newPerfilId = p.id as number;
    }

    let currentPerfilId: number | null = null;
    if (!newPerfilId || Array.isArray(permissoes)) {
      const { data: u, error: uerr } = await supabaseAdmin
        .from("usuario")
        .select("perfilid")
        .eq("id", userId)
        .maybeSingle();
      if (uerr) throw uerr;
      currentPerfilId = (u?.perfilid as number | null) ?? null;
    }

    const updatePayload: Record<string, any> = {};
    if (typeof nome !== "undefined") updatePayload.nome = nome;
    if (typeof email !== "undefined") updatePayload.email = email;
    if (typeof setorId !== "undefined") updatePayload.setorid = setorId;
    if (typeof newPerfilId !== "undefined") updatePayload.perfilid = newPerfilId;
    if (typeof ativo === "boolean") updatePayload.ativo = ativo;

    if (Object.keys(updatePayload).length > 0) {
      const { error: u2Err } = await supabaseAdmin
        .from("usuario")
        .update({ ...updatePayload, updatedat: new Date().toISOString() })
        .eq("id", userId);
      if (u2Err) throw u2Err;
    }

    if (Array.isArray(permissoes)) {
      const targetPerfilId =
        typeof newPerfilId !== "undefined" ? newPerfilId : currentPerfilId;
      if (!targetPerfilId) throw new Error("Sem perfil para aplicar permissões");

      const { data: allPerms, error: allErr } = await supabaseAdmin
        .from("permissao")
        .select("id, nome");
      if (allErr) throw allErr;

      const byName = new Map<string, number>(
        (allPerms ?? []).map((p) => [String(p.nome), Number(p.id)])
      );

      const { data: atuaisRows, error: atErr } = await supabaseAdmin
        .from("perfilpermissao")
        .select("permissaoid")
        .eq("perfilid", targetPerfilId);
      if (atErr) throw atErr;

      const atuais = new Set<number>(
        (atuaisRows ?? []).map((r) => Number(r.permissaoid))
      );
      const desejadas = new Set<number>();
      for (const nomePerm of permissoes) {
        const pid = byName.get(nomePerm);
        if (pid) desejadas.add(pid);
      }

      const toInsert = [...desejadas]
        .filter((id) => !atuais.has(id))
        .map((id) => ({ perfilid: targetPerfilId, permissaoid: id }));
      if (toInsert.length) {
        const { error: insErr } = await supabaseAdmin
          .from("perfilpermissao")
          .insert(toInsert);
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

    const { GET: listUsers } = await import("../route");
    return listUsers();
  } catch (e: any) {
    console.error("[/api/users/:id PUT] error:", e);
    const status = /não autenticado|unauth|auth/i.test(String(e?.message))
      ? 401
      : 500;
    return NextResponse.json(
      { error: e?.message ?? "Erro ao atualizar usuário" },
      { status }
    );
  }
}

// export async function DELETE(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const session = isOpen() ? null : await auth();
//     await ensureAccess(session);

//     const { id: userId } = await context.params;

//     const { error: dErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
//     if (dErr) throw dErr;

//     await supabaseAdmin.from("usuario").delete().eq("id", userId);

//     const { GET: listUsers } = await import("../route");
//     return listUsers();
//   } catch (e: any) {
//     console.error("[/api/users/:id DELETE] error:", e);
//     const status = /não autenticado|unauth|auth/i.test(String(e?.message))
//       ? 401
//       : 500;
//     return NextResponse.json(
//       { error: e?.message ?? "Erro ao remover usuário" },
//       { status }
//     );
//   }
// }
