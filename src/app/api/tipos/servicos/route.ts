// src/app/api/tipos/servicos/route.ts
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

// GET /api/tipos/servicos  -> listar serviços
export async function GET(req: NextRequest) {
  try {
    await ensureAuth();

    const { data, error } = await supabaseAdmin
      .from("servico")
      .select(`
        id,
        codigo,
        descricao,
        precohora,
        codigoservicomunicipal,
        aliquotaiss,
        cnae,
        itemlistaservico,
        tiposervicoid,
        ativo
      `)
      .order("descricao", { ascending: true });

    if (error) throw error;

    const items = (data ?? []).map((s: any) => ({
      id: s.id as number,
      codigo: s.codigo as string,
      descricao: s.descricao as string,
      precohora: Number(s.precohora ?? 0),
      codigoservicomunicipal: s.codigoservicomunicipal as string,
      aliquotaiss:
        s.aliquotaiss === null || s.aliquotaiss === undefined
          ? null
          : Number(s.aliquotaiss),
      cnae: (s.cnae as string | null) ?? null,
      itemlistaservico: s.itemlistaservico as string,
      tiposervicoid: (s.tiposervicoid as number | null) ?? null,
      ativo: typeof s.ativo === "boolean" ? s.ativo : true,
    }));

    return NextResponse.json({ items });
  } catch (e: any) {
    console.error("[/api/tipos/servicos GET] error:", e);
    const status = /auth|unauth|não autenticado/i.test(String(e?.message))
      ? 401
      : 500;
    return NextResponse.json(
      { error: e?.message ?? "Erro ao carregar serviços" },
      { status }
    );
  }
}

// POST /api/tipos/servicos  -> criar serviço
export async function POST(req: NextRequest) {
  try {
    await ensureAuth();

    const body = await req.json().catch(() => ({}));
    const {
      codigo,
      descricao,
      precohora,
      codigoservicomunicipal,
      aliquotaiss,
      cnae,
      itemlistaservico,
      tiposervicoid,
      ativo,
    } = body ?? {};

    if (!codigo?.trim() || !descricao?.trim()) {
      return NextResponse.json(
        { error: "Código e descrição são obrigatórios." },
        { status: 400 }
      );
    }

    const preco = Number(precohora);
    if (!Number.isFinite(preco)) {
      return NextResponse.json(
        { error: "Preço/hora inválido." },
        { status: 400 }
      );
    }

    if (!codigoservicomunicipal?.trim()) {
      return NextResponse.json(
        { error: "Código de serviço municipal é obrigatório." },
        { status: 400 }
      );
    }

    if (!itemlistaservico?.trim()) {
      return NextResponse.json(
        { error: "Item da lista de serviço é obrigatório." },
        { status: 400 }
      );
    }

    const aliq =
      aliquotaiss === null || aliquotaiss === undefined || aliquotaiss === ""
        ? null
        : Number(aliquotaiss);
    if (aliq !== null && !Number.isFinite(aliq)) {
      return NextResponse.json(
        { error: "Alíquota ISS inválida." },
        { status: 400 }
      );
    }

    const tipoId =
      tiposervicoid === null || tiposervicoid === undefined || tiposervicoid === ""
        ? null
        : Number(tiposervicoid);
    if (tipoId !== null && !Number.isFinite(tipoId)) {
      return NextResponse.json(
        { error: "Tipo de serviço (ID) inválido." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const payload: Record<string, any> = {
      codigo: codigo.trim(),
      descricao: descricao.trim(),
      precohora: preco,
      codigoservicomunicipal: codigoservicomunicipal.trim(),
      aliquotaiss: aliq,
      cnae: cnae?.trim() || null,
      itemlistaservico: itemlistaservico.trim(),
      tiposervicoid: tipoId,
      ativo: typeof ativo === "boolean" ? ativo : true,
      createdat: now,
      updatedat: now,
    };

    const { data, error } = await supabaseAdmin
      .from("servico")
      .insert(payload)
      .select(`
        id,
        codigo,
        descricao,
        precohora,
        codigoservicomunicipal,
        aliquotaiss,
        cnae,
        itemlistaservico,
        tiposervicoid,
        ativo
      `)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: "Erro ao criar serviço." },
        { status: 500 }
      );
    }

    const item = {
      id: data.id as number,
      codigo: data.codigo as string,
      descricao: data.descricao as string,
      precohora: Number(data.precohora ?? 0),
      codigoservicomunicipal: data.codigoservicomunicipal as string,
      aliquotaiss:
        data.aliquotaiss === null || data.aliquotaiss === undefined
          ? null
          : Number(data.aliquotaiss),
      cnae: (data.cnae as string | null) ?? null,
      itemlistaservico: data.itemlistaservico as string,
      tiposervicoid: (data.tiposervicoid as number | null) ?? null,
      ativo: typeof data.ativo === "boolean" ? data.ativo : true,
    };

    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    console.error("[/api/tipos/servicos POST] error:", e);
    const msg = String(e?.message ?? "");
    const status =
      /auth|unauth|não autenticado/i.test(msg)
        ? 401
        : /duplicate|unique|servico_codigo_key/i.test(msg)
        ? 409
        : 500;

    return NextResponse.json(
      { error: e?.message ?? "Erro ao criar serviço" },
      { status }
    );
  }
}
