export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  VENDA_ANEXO_CATEGORIA_VALUES,
  type VendaAnexoCategoria,
} from "@/lib/venda-anexo-categorias";

type Params = { id: string };

const BUCKET = "venda_anexos";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ANEXOS_POR_VENDA = 5;
const VENDA_ANEXO_CATEGORIAS_SET = new Set(VENDA_ANEXO_CATEGORIA_VALUES);

function sanitizeFileName(name: string) {
  return (name || "anexo")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.\-]+/g, "_")
    .slice(0, 120);
}

function extFromFile(file: File) {
  const name = String(file.name || "").toLowerCase();
  const match = name.match(/\.([a-z0-9]+)$/);
  if (match?.[1]) return match[1];

  const type = String(file.type || "").toLowerCase();
  if (type === "application/pdf") return "pdf";
  if (type === "image/png") return "png";
  if (type === "image/jpeg") return "jpg";
  if (type === "image/webp") return "webp";
  return "bin";
}

function isImageFile(file: File) {
  return String(file.type || "").toLowerCase().startsWith("image/");
}

async function parseId(context: { params: Promise<Params> }) {
  const { id } = await context.params;
  const vendaId = Number(String(id ?? "").trim());
  if (!Number.isInteger(vendaId) || vendaId <= 0) {
    throw new Error("ID da venda inválido.");
  }
  return vendaId;
}

async function ensureBucket() {
  const current = await supabaseAdmin.storage.getBucket(BUCKET);
  if (!current.error) return;

  const created = await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
  if (created.error && !created.error.message.toLowerCase().includes("already exists")) {
    throw created.error;
  }
}

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const vendaId = await parseId(context);
    const { data, error } = await supabaseAdmin
      .from("vendaanexo")
      .select("id, vendaid, nome, tipo, tamanho, url, path, descricao, categoria, createdat")
      .eq("vendaid", vendaId)
      .order("createdat", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [], maxAnexos: MAX_ANEXOS_POR_VENDA }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/venda/[id]/anexos", error);
    return NextResponse.json({ error: error?.message ?? "Erro ao listar anexos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<Params> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const vendaId = await parseId(context);
    const venda = await supabaseAdmin.from("venda").select("id").eq("id", vendaId).maybeSingle();
    if (venda.error) throw venda.error;
    if (!venda.data) return NextResponse.json({ error: "Venda não encontrada." }, { status: 404 });

    const { count, error: countError } = await supabaseAdmin
      .from("vendaanexo")
      .select("id", { count: "exact", head: true })
      .eq("vendaid", vendaId);

    if (countError) throw countError;
    if ((count ?? 0) >= MAX_ANEXOS_POR_VENDA) {
      return NextResponse.json(
        { error: `Limite de ${MAX_ANEXOS_POR_VENDA} anexos por venda atingido.` },
        { status: 400 },
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    const descricao = String(form.get("descricao") ?? "").trim() || null;
    const categoriaRaw = String(form.get("categoria") ?? "OUTROS").trim().toUpperCase();
    const categoria = VENDA_ANEXO_CATEGORIAS_SET.has(categoriaRaw as VendaAnexoCategoria)
      ? (categoriaRaw as VendaAnexoCategoria)
      : "OUTROS";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Envie um arquivo em 'file'." }, { status: 400 });
    }

    const fileType = String(file.type || "").toLowerCase();
    if (fileType !== "application/pdf" && !isImageFile(file)) {
      return NextResponse.json({ error: "Tipo de arquivo inválido. Envie imagem ou PDF." }, { status: 400 });
    }

    if (typeof file.size === "number" && file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo: 10MB." }, { status: 400 });
    }

    const originalName = sanitizeFileName(file.name);
    let ext = extFromFile(file);
    let contentType = file.type || "application/octet-stream";
    let buffer: Buffer = Buffer.from(await file.arrayBuffer());

    if (isImageFile(file)) {
      const { default: sharp } = await import("sharp");
      buffer = await sharp(buffer)
        .rotate()
        .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      ext = "webp";
      contentType = "image/webp";
    }

    const path = `venda/${vendaId}/anexos/${randomUUID()}.${ext}`;

    await ensureBucket();

    const { error: uploadError } = await supabaseAdmin.storage.from(BUCKET).upload(path, buffer, {
      contentType,
      upsert: false,
    });

    if (uploadError) {
      return NextResponse.json(
        { error: `Falha ao enviar anexo (bucket: ${BUCKET}): ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data: publicData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    const publicUrl = publicData?.publicUrl;
    if (!publicUrl) {
      return NextResponse.json({ error: "Falha ao gerar URL pública do anexo." }, { status: 500 });
    }

    const { data: saved, error: insertError } = await supabaseAdmin
      .from("vendaanexo")
      .insert({
        vendaid: vendaId,
        nome: originalName,
        tipo: contentType,
        tamanho: buffer.length,
        url: publicUrl,
        path,
        descricao,
        categoria,
      })
      .select("id, vendaid, nome, tipo, tamanho, url, path, descricao, categoria, createdat")
      .single();

    if (insertError) {
      await supabaseAdmin.storage.from(BUCKET).remove([path]);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ item: saved }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/venda/[id]/anexos", error);
    return NextResponse.json({ error: error?.message ?? "Erro ao anexar arquivo." }, { status: 500 });
  }
}
