// src/app/api/tipos/fornecedores/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function isOpen() {
  const v = (process.env.OPEN_PERMISSIONS ?? "").toString().trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

async function ensureAuth() {
  if (isOpen()) return;
  await auth();
}

// GET /api/tipos/fornecedores
export async function GET() {
  try {
    await ensureAuth();

    const { data, error } = await supabaseAdmin
      .from("fornecedor")
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
      .order("nomerazaosocial", { ascending: true });

    if (error) throw error;

    const items = (data ?? []).map((f: any) => ({
      id: f.id as number,
      cpfcnpj: f.cpfcnpj as string,
      nomerazaosocial: f.nomerazaosocial as string,
      nomefantasia: (f.nomefantasia as string | null) ?? null,
      endereco: (f.endereco as string | null) ?? null,
      cidade: (f.cidade as string | null) ?? null,
      estado: (f.estado as string | null) ?? null,
      cep: (f.cep as string | null) ?? null,
      contato: (f.contato as string | null) ?? null,
      ativo: typeof f.ativo === "boolean" ? f.ativo : true,
    }));

    return NextResponse.json({ items });
  } catch (e: any) {
    console.error("[/api/tipos/fornecedores GET] error:", e);
    const status = /auth|unauth|não autenticado/i.test(String(e?.message)) ? 401 : 500;
    return NextResponse.json(
      { error: e?.message ?? "Erro ao carregar fornecedores" },
      { status }
    );
  }
}

// POST /api/tipos/fornecedores
export async function POST(req: Request) {
  try {
    await ensureAuth();

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
    }: {
      cpfcnpj?: string;
      nomerazaosocial?: string;
      nomefantasia?: string | null;
      endereco?: string | null;
      cidade?: string | null;
      estado?: string | null;
      cep?: string | null;
      contato?: string | null;
    } = body ?? {};

    if (!cpfcnpj?.trim() || !nomerazaosocial?.trim()) {
      return NextResponse.json(
        { error: "CNPJ e Razão Social são obrigatórios." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const payload = {
      cpfcnpj: cpfcnpj.trim(),
      nomerazaosocial: nomerazaosocial.trim(),
      nomefantasia: nomefantasia?.trim() || null,
      endereco: endereco?.trim() || null,
      cidade: cidade?.trim() || null,
      estado: estado?.trim() || null,
      cep: cep?.trim() || null,
      contato: contato?.trim() || null,
      ativo: true,
      updatedat: now,
    };

    const { data, error } = await supabaseAdmin
      .from("fornecedor")
      .insert(payload)
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
      .single();

    if (error) throw error;

    const item = {
      id: data!.id as number,
      cpfcnpj: data!.cpfcnpj as string,
      nomerazaosocial: data!.nomerazaosocial as string,
      nomefantasia: (data!.nomefantasia as string | null) ?? null,
      endereco: (data!.endereco as string | null) ?? null,
      cidade: (data!.cidade as string | null) ?? null,
      estado: (data!.estado as string | null) ?? null,
      cep: (data!.cep as string | null) ?? null,
      contato: (data!.contato as string | null) ?? null,
      ativo: typeof data!.ativo === "boolean" ? data!.ativo : true,
    };

    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    console.error("[/api/tipos/fornecedores POST] error:", e);

    const msg = String(e?.message ?? "");
    const status =
      /auth|unauth|não autenticado/i.test(msg) ? 401 :
      /duplicate|unique|fornecedor_cnpj_key/i.test(msg) ? 409 :
      500;

    return NextResponse.json(
      { error: e?.message ?? "Erro ao salvar fornecedor" },
      { status }
    );
  }
}
