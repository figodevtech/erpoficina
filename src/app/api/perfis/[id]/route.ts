export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function obterPermissoesDaSessao(session: any): Set<string> {
  const arr = ((session?.user as any)?.permissoes ?? (session?.user as any)?.perms ?? []) as any[];
  return new Set(arr.map((p) => String(p).trim().toUpperCase()).filter(Boolean));
}

function exigirAcesso(session: any) {
  if (!session?.user) return { ok: false, status: 401 as const, msg: "Não autenticado" };

  const perms = obterPermissoesDaSessao(session);
  const ok = perms.has("CONFIG_ACESSO") || perms.has("USUARIOS_ACESSO");
  if (!ok) return { ok: false, status: 403 as const, msg: "Sem permissão" };

  return { ok: true as const };
}

type AtualizarPerfilPayload = {
  nome: string;
  descricao?: string | null;
  permissoesIds?: number[];
};

async function getParamId(ctx: any): Promise<string> {
  // compatível com params objeto OU params Promise (como você tinha)
  const p = await (ctx?.params ?? {});
  return p?.id;
}

export async function GET(req: NextRequest, ctx: any) {
  const session = await auth();
  const gate = exigirAcesso(session);
  if (!gate.ok) return NextResponse.json({ error: gate.msg }, { status: gate.status });

  const id = await getParamId(ctx);
  const perfilId = Number(id);
  if (!Number.isFinite(perfilId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const [perfilRes, permsRes] = await Promise.all([
    supabaseAdmin
      .from("perfil")
      .select(
        `
          id,
          nome,
          descricao,
          perfilpermissao (
            permissaoid,
            permissao:permissaoid ( id, nome, descricao )
          )
        `
      )
      .eq("id", perfilId)
      .single(),
    supabaseAdmin.from("permissao").select("id, nome, descricao").order("nome", { ascending: true }),
  ]);

  if (perfilRes.error) return NextResponse.json({ error: perfilRes.error.message }, { status: 500 });
  if (permsRes.error) return NextResponse.json({ error: permsRes.error.message }, { status: 500 });

  const data: any = perfilRes.data;

  const perfil = {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao ?? null,
    permissoes: (data.perfilpermissao ?? [])
      .map((pp: any) => pp?.permissao)
      .filter(Boolean)
      .map((perm: any) => ({ id: perm.id, nome: perm.nome, descricao: perm.descricao ?? null })),
  };

  const permissoes = (permsRes.data ?? []).map((perm: any) => ({
    id: perm.id,
    nome: perm.nome,
    descricao: perm.descricao ?? null,
  }));

  // compatibilidade: mantém as duas chaves
  return NextResponse.json(
    { perfil, permissoes, permissoesDisponiveis: permissoes },
    { status: 200 }
  );
}

export async function PUT(req: NextRequest, ctx: any) {
  const session = await auth();
  const gate = exigirAcesso(session);
  if (!gate.ok) return NextResponse.json({ error: gate.msg }, { status: gate.status });

  const id = await getParamId(ctx);
  const perfilId = Number(id);
  if (!Number.isFinite(perfilId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const body = (await req.json().catch(() => null)) as AtualizarPerfilPayload | null;
  const nome = body?.nome?.trim();
  const descricao = body?.descricao?.trim?.() ? body.descricao.trim() : null;
  const permissoesIds = (body?.permissoesIds ?? []).filter((n) => Number.isFinite(n)) as number[];

  if (!nome) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });

  // 1) atualiza perfil
  const { data: perfilAtualizado, error: ePerfil } = await supabaseAdmin
    .from("perfil")
    .update({ nome, descricao })
    .eq("id", perfilId)
    .select("id, nome, descricao")
    .single();

  if (ePerfil) return NextResponse.json({ error: ePerfil.message }, { status: 500 });

  // 2) substitui vínculos
  const { error: eDel } = await supabaseAdmin.from("perfilpermissao").delete().eq("perfilid", perfilId);
  if (eDel) return NextResponse.json({ error: eDel.message }, { status: 500 });

  if (permissoesIds.length > 0) {
    const rows = permissoesIds.map((permissaoid) => ({ perfilid: perfilId, permissaoid }));
    const { error: eIns } = await supabaseAdmin.from("perfilpermissao").insert(rows);
    if (eIns) return NextResponse.json({ error: eIns.message }, { status: 500 });
  }

  return NextResponse.json({ perfil: perfilAtualizado }, { status: 200 });
}
