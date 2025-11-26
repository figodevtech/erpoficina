// src/app/api/tipos/categorias-transacao/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function isOpen() {
  const v = (process.env.OPEN_PERMISSIONS ?? "")
    .toString()
    .trim()
    .toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "sim";
}

async function ensureAuth() {
  if (isOpen()) return;
  await auth();
}

// GET /api/tipos/categorias-transacao
export async function GET() {
  try {
    await ensureAuth();

    const { data, error } = await supabaseAdmin
      .from("categoriatransacao")
      .select(
        `
        id,
        nome,
        descricao,
        ativo
      `
      )
      .order("nome", { ascending: true });

    if (error) throw error;

    const items =
      (data ?? []).map((c) => ({
        id: c.id as number,
        nome: c.nome as string,
        descricao: (c.descricao as string | null) ?? null,
        ativo:
          typeof c.ativo === "boolean" ? (c.ativo as boolean) : true,
      })) ?? [];

    return NextResponse.json({ items });
  } catch (e: any) {
    console.error("[/api/tipos/categorias-transacao GET] error:", e);
    const msg = String(e?.message ?? "");
    const status = /auth|unauth|não autenticado/i.test(msg) ? 401 : 500;

    return NextResponse.json(
      {
        error:
          e?.message ?? "Erro ao carregar categorias de transação",
      },
      { status }
    );
  }
}

// POST /api/tipos/categorias-transacao
export async function POST(req: NextRequest) {
  try {
    await ensureAuth();

    const body = await req.json().catch(() => ({}));
    const {
      nome,
      descricao,
      ativo,
    } = body as {
      nome?: string;
      descricao?: string | null;
      ativo?: boolean;
    };

    if (!nome?.trim()) {
      return NextResponse.json(
        { error: "Nome da categoria é obrigatório." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const payload = {
      nome: nome.trim().toUpperCase(),
      descricao: descricao?.trim() || null,
      ativo: typeof ativo === "boolean" ? ativo : true,
      createdat: now,
      updatedat: now,
    };

    const { data, error } = await supabaseAdmin
      .from("categoriatransacao")
      .insert(payload)
      .select(
        `
        id,
        nome,
        descricao,
        ativo
      `
      )
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: "Falha ao criar categoria." },
        { status: 500 }
      );
    }

    const item = {
      id: data.id as number,
      nome: data.nome as string,
      descricao: (data.descricao as string | null) ?? null,
      ativo:
        typeof data.ativo === "boolean"
          ? (data.ativo as boolean)
          : true,
    };

    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    console.error("[/api/tipos/categorias-transacao POST] error:", e);
    const msg = String(e?.message ?? "");
    const status = /auth|unauth|não autenticado/i.test(msg)
      ? 401
      : /duplicate|unique|categoriatransacao_nome_key/i.test(msg)
      ? 409
      : 500;

    return NextResponse.json(
      {
        error:
          e?.message ?? "Erro ao cadastrar categoria de transação",
      },
      { status }
    );
  }
}
