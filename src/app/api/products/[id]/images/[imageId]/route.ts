export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { id: string; imageId: string };

const BUCKET = "produto_imagem";

async function parseParams(context: { params: Promise<Params> }) {
  const { id, imageId } = await context.params;

  const produtoId = Number((id ?? "").trim());
  const imgId = Number((imageId ?? "").trim());

  if (!Number.isInteger(produtoId) || produtoId <= 0) throw new Error("ID inválido.");
  if (!Number.isInteger(imgId) || imgId <= 0) throw new Error("Imagem inválida.");

  return { produtoId, imgId };
}

/* ========================= PATCH (definir principal) ========================= */
/**
 * Body: { principal: true }
 * - atualiza produto.imgUrl para url da imagem
 */
export async function PATCH(req: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { produtoId, imgId } = await parseParams(context);
    const body = await req.json().catch(() => ({}));

    if (body?.principal !== true) {
      return NextResponse.json({ error: "Envie { principal: true }" }, { status: 400 });
    }

    const { data: img, error } = await supabaseAdmin
      .from("produto_imagem")
      .select("id, produto_id, url")
      .eq("id", imgId)
      .eq("produto_id", produtoId)
      .single();

    if (error || !img) {
      return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 });
    }

    const { error: updErr } = await supabaseAdmin
      .from("produto")
      .update({ imgUrl: img.url, updatedat: new Date().toISOString() })
      .eq("id", produtoId);

    if (updErr) {
      console.error("[PATCH image principal] update produto error:", updErr);
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error("[PATCH image principal] exception:", e);
    return NextResponse.json({ error: e?.message ?? "Erro ao definir imagem principal" }, { status: 500 });
  }
}

/* ========================= DELETE (remover imagem) ========================= */
export async function DELETE(_req: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { produtoId, imgId } = await parseParams(context);

    const { data: img, error } = await supabaseAdmin
      .from("produto_imagem")
      .select("id, produto_id, url, path")
      .eq("id", imgId)
      .eq("produto_id", produtoId)
      .single();

    if (error || !img) {
      return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 });
    }

    // remove do storage
    const { error: rmErr } = await supabaseAdmin.storage.from(BUCKET).remove([img.path]);
    if (rmErr) {
      console.error("[DELETE image] storage remove error:", rmErr);
      return NextResponse.json({ error: rmErr.message, where: "storage.remove", bucket: BUCKET }, { status: 500 });
    }

    // remove do banco
    const { error: delErr } = await supabaseAdmin.from("produto_imagem").delete().eq("id", imgId);
    if (delErr) {
      console.error("[DELETE image] db delete error:", delErr);
      return NextResponse.json({ error: delErr.message, where: "db.delete produto_imagem" }, { status: 500 });
    }

    // se a imagem removida era a capa, aponta pra próxima ou null
    const { data: prod, error: prodErr } = await supabaseAdmin
      .from("produto")
      .select('id, "imgUrl"')
      .eq("id", produtoId)
      .single();

    if (!prodErr && prod?.imgUrl === img.url) {
      const { data: nextImg } = await supabaseAdmin
        .from("produto_imagem")
        .select("url")
        .eq("produto_id", produtoId)
        .order("ordem", { ascending: true })
        .limit(1)
        .maybeSingle();

      await supabaseAdmin
        .from("produto")
        .update({ imgUrl: nextImg?.url ?? null, updatedat: new Date().toISOString() })
        .eq("id", produtoId);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error("[DELETE image] exception:", e);
    return NextResponse.json({ error: e?.message ?? "Erro ao remover imagem" }, { status: 500 });
  }
}
