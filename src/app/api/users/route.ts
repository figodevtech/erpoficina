// app/api/users/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureAccess } from "./_authz";

function isOpen() {
  const v = (process.env.OPEN_PERMISSIONS ?? "")
    .toString()
    .trim()
    .toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

function gerarSenhaTemporaria() {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
    return (crypto as any).randomUUID().replace(/-/g, "").slice(0, 16);
  }
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2)
  );
}

// Agora recebe opções pra filtrar (ativos / busca)
async function carregarUsuarios(opts?: { onlyActive?: boolean; q?: string }) {
  const onlyActive = opts?.onlyActive ?? false;
  const q = (opts?.q ?? "").trim();

  let query = supabaseAdmin
    .from("usuario")
    .select(
      "id, nome, email, createdat, updatedat, ativo, perfil:perfilid(id,nome), setor:setorid(id,nome)"
    )
    .order("createdat", { ascending: false });

  if (onlyActive) {
    query = query.eq("ativo", true);
  }

  if (q) {
    // busca simples por nome OU email
    query = query.or(`nome.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: usuarios, error: uErr } = await query;
  if (uErr) throw uErr;

  return (usuarios ?? []).map((u: any) => ({
    id: u.id as string,
    nome: u.nome as string,
    email: u.email as string,
    createdAt: u.createdat as string | null,
    updatedAt: u.updatedat as string | null,
    ativo: typeof u.ativo === "boolean" ? u.ativo : true,
    perfil: u.perfil
      ? { id: u.perfil.id as number, nome: u.perfil.nome as string }
      : null,
    setor: u.setor
      ? { id: u.setor.id as number, nome: u.setor.nome as string }
      : null,
    perfilId: u.perfil?.id as number | undefined,
    setorId: u.setor?.id as number | undefined,
  }));
}

// GET /api/users
// GET /api/users?ativos=1&q=fulano
export async function GET(req: NextRequest) {
  try {
    const session = isOpen() ? null : await auth();
    await ensureAccess(session);

    const { searchParams } = new URL(req.url);
    const ativos = searchParams.get("ativos"); // "1" => só ativos
    const q = searchParams.get("q") ?? "";

    const users = await carregarUsuarios({
      onlyActive: ativos === "1",
      q,
    });

    return NextResponse.json({ users });
  } catch (e: any) {
    console.error("[/api/users GET] error:", e);
    const status = /não autenticado|unauth|auth/i.test(String(e?.message))
      ? 401
      : 500;
    return NextResponse.json(
      { error: e?.message ?? "Erro ao listar usuários" },
      { status }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = isOpen() ? null : await auth();
    await ensureAccess(session);

    const body = (await req.json().catch(() => ({}))) as any;

    const nome = (body.nome ?? "").toString().trim();
    const email = (body.email ?? "").toString().trim();

    // aceitamos tanto perfilid / setorid quanto perfilId / setorId
    const perfilidRaw = body.perfilid ?? body.perfilId ?? null;
    const perfilNome = body.perfilNome as string | undefined;
    const setoridRaw = body.setorid ?? body.setorId ?? null;
    const bodyAtivo = body.ativo as boolean | undefined;

    if (!nome || !email) {
      throw new Error("Nome e e-mail são obrigatórios");
    }

    let resolvedPerfilId: number | null = null;
    if (typeof perfilidRaw === "number") {
      resolvedPerfilId = perfilidRaw;
    }

    if (!resolvedPerfilId && perfilNome) {
      const { data: p, error: perr } = await supabaseAdmin
        .from("perfil")
        .select("id")
        .eq("nome", perfilNome)
        .maybeSingle();
      if (perr) throw perr;
      if (!p?.id) throw new Error("Perfil não encontrado");
      resolvedPerfilId = p.id as number;
    }

    if (!resolvedPerfilId) {
      throw new Error("Informe o perfil do usuário.");
    }

    const setorid =
      typeof setoridRaw === "number" ? (setoridRaw as number) : null;
    const ativo = typeof bodyAtivo === "boolean" ? bodyAtivo : true;

    const senhaTemp = gerarSenhaTemporaria();

    const { data: created, error: cErr } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: senhaTemp,
        email_confirm: true,
        user_metadata: {
          nome,
          setorid,
          perfilid: resolvedPerfilId,
        },
      });

    if (cErr || !created?.user) {
      throw cErr ?? new Error("Falha ao criar usuário no Auth");
    }

    const userId = created.user.id;

    const { error: upErr } = await supabaseAdmin.from("usuario").upsert(
      {
        id: userId,
        email,
        nome,
        setorid,
        perfilid: resolvedPerfilId,
        ativo,
        updatedat: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (upErr) throw upErr;

    // Depois de criar, sigo retornando a lista completa (como antes)
    const users = await carregarUsuarios();
    return NextResponse.json({ users });
  } catch (e: any) {
    console.error("[/api/users POST] error:", e);
    const status = /não autenticado|unauth|auth/i.test(String(e?.message))
      ? 401
      : 500;
    return NextResponse.json(
      { error: e?.message ?? "Erro ao criar usuário" },
      { status }
    );
  }
}
