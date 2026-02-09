export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { auth } from "@/lib/auth";

type Params = { id: string };

// Bucket de documentos fiscais (precisa existir no Supabase Storage).
const BUCKET = "danfe";

function extFromFile(file: File) {
  const name = String(file.name || "").toLowerCase();
  const m = name.match(/\.([a-z0-9]+)$/);
  if (m?.[1]) return m[1];

  const type = String(file.type || "").toLowerCase();
  if (type === "application/pdf") return "pdf";
  if (type === "image/png") return "png";
  if (type === "image/jpeg") return "jpg";
  if (type === "image/webp") return "webp";
  return "bin";
}

async function parseId(context: { params: Promise<Params> }) {
  const { id } = await context.params;
  const n = Number(String(id ?? "").trim());
  if (!Number.isInteger(n) || n <= 0) {
    return { ok: false as const, status: 400 as const, error: "ID inválido." };
  }
  return { ok: true as const, id: n };
}

export async function POST(req: NextRequest, context: { params: Promise<Params> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const parsed = await parseId(context);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    const vendaId = parsed.id;

    const form = await req.formData();
    const file =
      (form.get("file") as any) ??
      (form.getAll("files").find((x) => x instanceof File) as any) ??
      null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Envie um arquivo em 'file' (ou 'files')." }, { status: 400 });
    }

    // Aceita apenas PDF (DANFE).
    const mime = String(file.type || "").toLowerCase();
    const isPdf = mime === "application/pdf";
    if (!isPdf) {
      return NextResponse.json({ error: "Arquivo inválido. Envie apenas PDF." }, { status: 400 });
    }

    // Limite simples (10MB) para evitar uploads acidentais muito grandes.
    if (typeof file.size === "number" && file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo: 10MB." }, { status: 400 });
    }

    const ext = "pdf";
    const path = `venda/${vendaId}/danfe/${randomUUID()}.${ext}`;

    const buf = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await supabaseAdmin.storage.from(BUCKET).upload(path, buf, {
      contentType: file.type || (isPdf ? "application/pdf" : "application/octet-stream"),
      upsert: false,
    });

    if (upErr) {
      return NextResponse.json(
        { error: `Falha ao enviar DANFE (bucket: ${BUCKET}): ${upErr.message}` },
        { status: 500 }
      );
    }

    const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    const publicUrl = pub?.publicUrl;
    if (!publicUrl) {
      return NextResponse.json({ error: "Falha ao gerar URL pública do DANFE." }, { status: 500 });
    }

    const { error: updErr } = await supabaseAdmin
      .from("venda")
      .update({ danfe_url: publicUrl, updatedat: new Date().toISOString() })
      .eq("id", vendaId);

    if (updErr) {
      return NextResponse.json({ error: `Falha ao salvar URL do DANFE: ${updErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, danfeUrl: publicUrl }, { status: 200 });
  } catch (e: any) {
    console.error("POST /api/venda/[id]/danfe/upload", e);
    return NextResponse.json({ error: e?.message ?? "Erro ao anexar DANFE." }, { status: 500 });
  }
}
