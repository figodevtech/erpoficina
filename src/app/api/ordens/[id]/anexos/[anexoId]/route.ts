export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { id: string; anexoId: string };
const BUCKET = "os_anexos";

async function parseParams(context: { params: Promise<Params> }) {
  const { id, anexoId } = await context.params;
  const osId = Number(String(id ?? "").trim());
  const targetId = Number(String(anexoId ?? "").trim());

  if (!Number.isInteger(osId) || osId <= 0) {
    throw new Error("ID da OS invalido.");
  }
  if (!Number.isInteger(targetId) || targetId <= 0) {
    throw new Error("ID do anexo invalido.");
  }

  return { osId, anexoId: targetId };
}

export async function DELETE(_req: NextRequest, context: { params: Promise<Params> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    const { osId, anexoId } = await parseParams(context);

    const { data: anexo, error: selectError } = await supabaseAdmin
      .from("osanexo")
      .select("id, path")
      .eq("id", anexoId)
      .eq("ordemservicoid", osId)
      .maybeSingle();

    if (selectError) throw selectError;
    if (!anexo) {
      return NextResponse.json({ error: "Anexo nao encontrado." }, { status: 404 });
    }

    if (anexo.path) {
      const { error: removeError } = await supabaseAdmin.storage.from(BUCKET).remove([anexo.path]);
      if (removeError) {
        console.warn("Falha ao remover arquivo do storage", removeError);
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from("osanexo")
      .delete()
      .eq("id", anexoId)
      .eq("ordemservicoid", osId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/ordens/[id]/anexos/[anexoId]", error);
    return NextResponse.json({ error: error?.message ?? "Erro ao remover anexo da OS." }, { status: 500 });
  }
}
