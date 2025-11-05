// app/api/checklists/[checklistId]/images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { checklistId: string };

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const checklistId = Number(params.checklistId);
  if (!Number.isFinite(checklistId)) {
    return NextResponse.json({ error: "checklistId inválido" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("imagemvistoria")
    .select("id, url, descricao, createdat")
    .eq("checklistid", checklistId)
    .order("createdat", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ images: data ?? [] });
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const checklistId = Number(params.checklistId);
  if (!Number.isFinite(checklistId)) {
    return NextResponse.json({ error: "checklistId inválido" }, { status: 400 });
  }

  const { url, descricao } = (await req.json().catch(() => ({}))) as {
    url?: string;
    descricao?: string | null;
  };

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Campo 'url' é obrigatório" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("imagemvistoria")
    .insert({ checklistid: checklistId, url, descricao: descricao ?? null })
    .select("id, url, descricao, createdat")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ image: data }, { status: 201 });
}
