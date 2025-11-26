// src/app/api/tipos/categorias-transacao/[id]/route.ts
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

function parseId(paramId: string): number | null {
  const n = Number(paramId);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

// PUT /api/tipos/categorias-transacao/[id]  -> editar nome/descrição/ativo
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAuth();

    const { id } = await context.params;
    const categoriaId = parseId(id);
    if (!categoriaId) {
      return NextResponse.json(
        { error: "ID inválido." },
        { status: 400 }
      );
    }

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

    const payload: Record<string, any> = {
      nome: nome.trim().toUpperCase(),
      descricao: descricao?.trim() || null,
      updatedat: now,
    };

    if (typeof ativo === "boolean") {
      payload.ativo = ativo;
    }

    const { data, error } = await supabaseAdmin
      .from("categoriatransacao")
      .update(payload)
      .eq("id", categoriaId)
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
        { error: "Categoria de transação não encontrada." },
        { status: 404 }
      );
    }

    const item = {
      id: data.id as number,
      nome: data.nome as string,
      descricao: (data.descricao as string | null) ?? null,
      ativo:
        typeof data.ativo === "boolean"
          ? (data.ativo as boolean)
          : typeof ativo === "boolean"
          ? ativo
          : true,
    };

    return NextResponse.json({ item });
  } catch (e: any) {
    console.error(
      "[/api/tipos/categorias-transacao/:id PUT] error:",
      e
    );
    const msg = String(e?.message ?? "");
    const status = /auth|unauth|não autenticado/i.test(msg)
      ? 401
      : /duplicate|unique|categoriatransacao_nome_key/i.test(msg)
      ? 409
      : 500;

    return NextResponse.json(
      {
        error:
          e?.message ??
          "Erro ao atualizar categoria de transação",
      },
      { status }
    );
  }
}

// PATCH /api/tipos/categorias-transacao/[id]  -> só 'ativo'
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAuth();

    const { id } = await context.params;
    const categoriaId = parseId(id);
    if (!categoriaId) {
      return NextResponse.json(
        { error: "ID inválido." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { ativo } = body as { ativo?: boolean };

    if (typeof ativo !== "boolean") {
      return NextResponse.json(
        { error: "Campo 'ativo' deve ser booleano." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("categoriatransacao")
      .update({ ativo, updatedat: now })
      .eq("id", categoriaId)
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
        { error: "Categoria de transação não encontrada." },
        { status: 404 }
      );
    }

    const item = {
      id: data.id as number,
      nome: data.nome as string,
      descricao: (data.descricao as string | null) ?? null,
      ativo:
        typeof data.ativo === "boolean"
          ? (data.ativo as boolean)
          : ativo,
    };

    return NextResponse.json({ item });
  } catch (e: any) {
    console.error(
      "[/api/tipos/categorias-transacao/:id PATCH] error:",
      e
    );
    const status = /auth|unauth|não autenticado/i.test(
      String(e?.message)
    )
      ? 401
      : 500;

    return NextResponse.json(
      {
        error:
          e?.message ??
          "Erro ao atualizar status da categoria de transação",
      },
      { status }
    );
  }
}
