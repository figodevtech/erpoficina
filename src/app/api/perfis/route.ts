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

type CriarPerfilPayload = {
  nome: string;
  descricao?: string | null;
  permissoesIds?: number[];
};

export async function GET() {
  const session = await auth();
  const gate = exigirAcesso(session);
  if (!gate.ok) return NextResponse.json({ error: gate.msg }, { status: gate.status });

  const [perfisRes, permsRes] = await Promise.all([
    supabaseAdmin
      .from("perfil")
      .select(
        `
          id,
          nome,
          descricao,
          createdat,
          updatedat,
          perfilpermissao (
            permissaoid,
            permissao:permissaoid ( id, nome, descricao )
          )
        `
      )
      .order("id", { ascending: true }),

    supabaseAdmin.from("permissao").select("id, nome, descricao").order("nome", { ascending: true }),
  ]);

  if (perfisRes.error) return NextResponse.json({ error: perfisRes.error.message }, { status: 500 });
  if (permsRes.error) return NextResponse.json({ error: permsRes.error.message }, { status: 500 });

  const perfis = (perfisRes.data ?? []).map((p: any) => ({
    id: p.id,
    nome: p.nome,
    descricao: p.descricao ?? null,
    permissoes: (p.perfilpermissao ?? [])
      .map((pp: any) => pp?.permissao)
      .filter(Boolean)
      .map((perm: any) => ({ id: perm.id, nome: perm.nome, descricao: perm.descricao ?? null })),
  }));

  const permissoes = (permsRes.data ?? []).map((perm: any) => ({
    id: perm.id,
    nome: perm.nome,
    descricao: perm.descricao ?? null,
  }));

  // compatibilidade: mantém as duas chaves
  return NextResponse.json(
    { perfis, permissoes, permissoesDisponiveis: permissoes },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const gate = exigirAcesso(session);
  if (!gate.ok) return NextResponse.json({ error: gate.msg }, { status: gate.status });

  const body = (await req.json().catch(() => null)) as CriarPerfilPayload | null;
  const nome = body?.nome?.trim();
  const descricao = body?.descricao?.trim?.() ? body.descricao.trim() : null;
  const permissoesIds = (body?.permissoesIds ?? []).filter((n) => Number.isFinite(n)) as number[];

  if (!nome) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });

  const { data: perfilCriado, error: ePerfil } = await supabaseAdmin
    .from("perfil")
    .insert({ nome, descricao })
    .select("id, nome, descricao")
    .single();

  if (ePerfil) return NextResponse.json({ error: ePerfil.message }, { status: 500 });

  if (permissoesIds.length > 0) {
    const rows = permissoesIds.map((permissaoid) => ({ perfilid: perfilCriado.id, permissaoid }));
    const { error: eIns } = await supabaseAdmin.from("perfilpermissao").insert(rows);
    if (eIns) return NextResponse.json({ error: eIns.message }, { status: 500 });
  }

  return NextResponse.json({ perfil: perfilCriado }, { status: 201 });
}
