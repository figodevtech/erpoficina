export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { id: string; anexoId: string };

const BUCKET = "venda_anexos";

async function parseParams(context: { params: Promise<Params> }) {
  const { id, anexoId } = await context.params;
  const vendaId = Number(String(id ?? "").trim());
  const anexoIdNum = Number(String(anexoId ?? "").trim());

  if (!Number.isInteger(vendaId) || vendaId <= 0) {
    throw new Error("ID da venda inválido.");
  }
  if (!Number.isInteger(anexoIdNum) || anexoIdNum <= 0) {
    throw new Error("ID do anexo inválido.");
  }

  return { vendaId, anexoId: anexoIdNum };
}

export async function DELETE(_req: NextRequest, context: { params: Promise<Params> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { vendaId, anexoId } = await parseParams(context);
    const { data: anexo, error: selectError } = await supabaseAdmin
      .from("vendaanexo")
      .select("id, vendaid, path")
      .eq("id", anexoId)
      .eq("vendaid", vendaId)
      .maybeSingle();

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }
    if (!anexo) {
      return NextResponse.json({ error: "Anexo não encontrado." }, { status: 404 });
    }

    const { error: removeError } = await supabaseAdmin.storage.from(BUCKET).remove([anexo.path]);
    if (removeError) {
      return NextResponse.json({ error: removeError.message, where: "storage.remove", bucket: BUCKET }, { status: 500 });
    }

    const { error: deleteError } = await supabaseAdmin.from("vendaanexo").delete().eq("id", anexoId);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/venda/[id]/anexos/[anexoId]", error);
    return NextResponse.json({ error: error?.message ?? "Erro ao excluir anexo." }, { status: 500 });
  }
}
