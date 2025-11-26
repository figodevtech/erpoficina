// src/app/api/tipos/fornecedores/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function isOpen() {
  const v = (process.env.OPEN_PERMISSIONS ?? "").toString().trim().toLowerCase();
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

// PUT /api/tipos/fornecedores/[id]  -> editar cadastro completo
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAuth();

    const { id } = await context.params;
    const fornecedorId = parseId(id);
    if (!fornecedorId) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      cpfcnpj,
      nomerazaosocial,
      nomefantasia,
      endereco,
      cidade,
      estado,
      cep,
      contato,
      ativo,
    }: {
      cpfcnpj?: string;
      nomerazaosocial?: string;
      nomefantasia?: string | null;
      endereco?: string | null;
      cidade?: string | null;
      estado?: string | null;
      cep?: string | null;
      contato?: string | null;
      ativo?: boolean;
    } = body ?? {};

    if (!cpfcnpj?.trim() || !nomerazaosocial?.trim()) {
      return NextResponse.json(
        { error: "CNPJ e Razão Social são obrigatórios." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const payload: Record<string, any> = {
      cpfcnpj: cpfcnpj.trim(),
      nomerazaosocial: nomerazaosocial.trim(),
      nomefantasia: nomefantasia?.trim() || null,
      endereco: endereco?.trim() || null,
      cidade: cidade?.trim() || null,
      estado: estado?.trim() || null,
      cep: cep?.trim() || null,
      contato: contato?.trim() || null,
      updatedat: now,
    };

    // só atualiza 'ativo' se vier booleano no body
    if (typeof ativo === "boolean") {
      payload.ativo = ativo;
    }

    const { data, error } = await supabaseAdmin
      .from("fornecedor")
      .update(payload)
      .eq("id", fornecedorId)
      .select(`
        id,
        cpfcnpj,
        nomerazaosocial,
        nomefantasia,
        endereco,
        cidade,
        estado,
        cep,
        contato,
        ativo
      `)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: "Fornecedor não encontrado." },
        { status: 404 }
      );
    }

    const item = {
      id: data.id as number,
      cpfcnpj: data.cpfcnpj as string,
      nomerazaosocial: data.nomerazaosocial as string,
      nomefantasia: (data.nomefantasia as string | null) ?? null,
      endereco: (data.endereco as string | null) ?? null,
      cidade: (data.cidade as string | null) ?? null,
      estado: (data.estado as string | null) ?? null,
      cep: (data.cep as string | null) ?? null,
      contato: (data.contato as string | null) ?? null,
      ativo: typeof data.ativo === "boolean" ? data.ativo : true,
    };

    return NextResponse.json({ item });
  } catch (e: any) {
    console.error("[/api/tipos/fornecedores/:id PUT] error:", e);
    const msg = String(e?.message ?? "");
    const status =
      /auth|unauth|não autenticado/i.test(msg) ? 401 :
      /duplicate|unique|fornecedor_cnpj_key/i.test(msg) ? 409 :
      500;

    return NextResponse.json(
      { error: e?.message ?? "Erro ao atualizar fornecedor" },
      { status }
    );
  }
}
// PATCH /api/tipos/fornecedores/[id]  -> alterar somente 'ativo'
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAuth();

    const { id } = await context.params;
    const fornecedorId = parseId(id);
    if (!fornecedorId) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
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
      .from("fornecedor")
      .update({ ativo, updatedat: now })
      .eq("id", fornecedorId)
      .select(`
        id,
        cpfcnpj,
        nomerazaosocial,
        nomefantasia,
        endereco,
        cidade,
        estado,
        cep,
        contato,
        ativo
      `)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: "Fornecedor não encontrado." },
        { status: 404 }
      );
    }

    const item = {
      id: data.id as number,
      cpfcnpj: data.cpfcnpj as string,
      nomerazaosocial: data.nomerazaosocial as string,
      nomefantasia: (data.nomefantasia as string | null) ?? null,
      endereco: (data.endereco as string | null) ?? null,
      cidade: (data.cidade as string | null) ?? null,
      estado: (data.estado as string | null) ?? null,
      cep: (data.cep as string | null) ?? null,
      contato: (data.contato as string | null) ?? null,
      ativo: typeof data.ativo === "boolean" ? data.ativo : ativo,
    };

    return NextResponse.json({ item });
  } catch (e: any) {
    console.error("[/api/tipos/fornecedores/:id PATCH] error:", e);
    const status = /auth|unauth|não autenticado/i.test(String(e?.message)) ? 401 : 500;
    return NextResponse.json(
      { error: e?.message ?? "Erro ao atualizar status do fornecedor" },
      { status }
    );
  }
}
