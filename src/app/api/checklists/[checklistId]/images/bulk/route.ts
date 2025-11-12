// src/app/api/checklists/[checklistId]/images/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type BodyRow = { checklistid: number; url: string; descricao?: string | null };

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as { items?: BodyRow[] } | BodyRow[];
    const items = Array.isArray(body) ? body : body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const sane = items
      .map((r) => ({
        checklistid: Number(r?.checklistid),
        url: String(r?.url ?? "").trim(),
        descricao: (r?.descricao ?? null) as string | null,
      }))
      .filter((r) => Number.isFinite(r.checklistid) && !!r.url);

    if (sane.length === 0) {
      return NextResponse.json({ error: "Nenhuma linha válida" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("imagemvistoria")
      .insert(sane)
      .select("id, checklistid, url, descricao, createdat");

    if (error) throw error;
    return NextResponse.json({ items: data ?? [] }, { status: 201 });
  } catch (err: any) {
    console.error("[POST] /api/checklists/[checklistId]/images/bulk", err);
    return NextResponse.json(
      { error: err?.message || "Falha ao salvar imagens" },
      { status: 500 }
    );
  }
}
