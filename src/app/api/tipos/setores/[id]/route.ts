// src/app/api/tipos/setores/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// 👇 Tipo correto para o contexto em Next 15 (params é um Promise)
type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    // 👇 agora precisamos "await" nos params
    const { id } = await params;
    const setorId = Number(id);

    if (!setorId || Number.isNaN(setorId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const nome = (body?.nome ?? "").trim();
    const descricao = (body?.descricao ?? null) as string | null;
    const responsavel = (body?.responsavel ?? null) as string | null;
    const ativo =
      typeof body?.ativo === "boolean" ? (body.ativo as boolean) : true;

    if (!nome) {
      return NextResponse.json(
        { error: "Nome do setor é obrigatório." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("setor")
      .update({
        nome,
        descricao,
        responsavel,
        ativo,
      })
      .eq("id", setorId)
      .select("id,nome,descricao,responsavel,ativo")
      .single();

    if (error) throw error;

    return NextResponse.json(
      { item: data },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err: any) {
    console.error("PUT /api/tipos/setores/[id]", err);
    return NextResponse.json(
      { error: "Falha ao atualizar setor" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const setorId = Number(id);

    if (!setorId || Number.isNaN(setorId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const patch: any = {};

    if (typeof body?.nome === "string") patch.nome = body.nome.trim();
    if (typeof body?.descricao === "string")
      patch.descricao = body.descricao.trim() || null;
    if (typeof body?.responsavel === "string")
      patch.responsavel = body.responsavel.trim() || null;
    if (typeof body?.ativo === "boolean") patch.ativo = body.ativo;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "Nada para atualizar" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("setor")
      .update(patch)
      .eq("id", setorId)
      .select("id,nome,descricao,responsavel,ativo")
      .single();

    if (error) throw error;

    return NextResponse.json(
      { item: data },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err: any) {
    console.error("PATCH /api/tipos/setores/[id]", err);
    return NextResponse.json(
      { error: "Falha ao atualizar setor" },
      { status: 500 }
    );
  }
}
