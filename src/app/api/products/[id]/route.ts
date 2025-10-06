// src/app/api/produtos/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { params: Promise<{ id: string }> };

const PRODUTO_FIELDS = `
  id, descricao, precovenda, estoque, estoqueminimo, ncm, cfop, unidade,
  cest, csosn, aliquotaicms, codigobarras, createdat, updatedat, referencia,
  titulo, status_estoque, fornecedor, fabricante, grupo
`;

const WRITABLE_FIELDS = new Set([
  "descricao",
  "precovenda",
  "estoque",
  "estoqueminimo",
  "ncm",
  "cfop",
  "unidade",
  "cest",
  "csosn",
  "aliquotaicms",
  "codigobarras",
  "referencia",
  "titulo",
  "fornecedor",
  "fabricante",
  "grupo",
]);

function toNullIfEmpty(v: unknown) {
  return typeof v === "string" && v.trim() === "" ? null : v;
}

function toNumberOrNull(v: any) {
  if (v == null || (typeof v === "string" && v.trim() === "")) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * - Converte strings vazias para null
 * - Coerce campos numéricos para number (ou null)
 * - No PUT (strict=true) exige campos obrigatórios
 */
function sanitizePayload(body: any, { strict }: { strict: boolean }) {
  const out: Record<string, any> = {};

  for (const key of Object.keys(body ?? {})) {
    if (!WRITABLE_FIELDS.has(key)) continue;

    // Mapeia conversões por tipo esperado
    switch (key) {
      case "precovenda":
      case "aliquotaicms":
        out[key] = toNumberOrNull(body[key]);
        break;
      case "estoque":
      case "estoqueminimo":
        // inteiros
        out[key] = toNumberOrNull(body[key]);
        if (out[key] != null) out[key] = Math.trunc(out[key]);
        break;
      default:
        out[key] = toNullIfEmpty(body[key]);
    }
  }

  // Valida obrigatórios no PUT
  if (strict) {
    const required = ["descricao", "precovenda", "ncm", "cfop", "csosn"];
    const missing = required.filter((k) => out[k] == null);
    if (missing.length) {
      throw new Error(
        `Campos obrigatórios ausentes no PUT: ${missing.join(", ")}`
      );
    }
  }

  // Deixa que os enums (unidade, grupo etc.) sejam validados pelo Postgres
  // Atualiza timestamp
  out.updatedat = new Date().toISOString();
  return out;
}

async function parseId(ctx: Params) {
  const { id: idParam } = await ctx.params;
  const id = Number((idParam ?? "").trim());
  if (!id) throw new Error("ID inválido.");
  return id;
}

/* ========================= GET ========================= */

export async function GET(_: Request, ctx: Params) {
  try {
    const id = await parseId(ctx);

    const { data, error } = await supabaseAdmin
      .from("produto")
      .select(PRODUTO_FIELDS)
      .eq("id", id)
      .single();

    if (error) {
      if ((error as any).code === "PGRST116") {
        return NextResponse.json(
          { error: "Produto não encontrado." },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    const msg = e?.message ?? "Erro ao buscar produto.";
    const status = msg.includes("ID inválido") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

/* ========================= PATCH ========================= */

export async function PATCH(req: NextRequest, ctx: Params) {
  try {
    const id = await parseId(ctx);
    const body = await req.json().catch(() => ({}));
    const payload = sanitizePayload(body, { strict: false });

    if (Object.keys(payload).length === 1 && "updatedat" in payload) {
      return NextResponse.json(
        { error: "Nada para atualizar." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("produto")
      .update(payload)
      .eq("id", id)
      .select(PRODUTO_FIELDS)
      .single();

    if (error) {
      if ((error as any).code === "23505") {
        // Caso exista alguma UNIQUE (ex.: codigobarras), trate aqui:
        return NextResponse.json(
          { error: "Violação de unicidade (já cadastrado)." },
          { status: 409 }
        );
      }
      if ((error as any).code === "PGRST116") {
        return NextResponse.json(
          { error: "Produto não encontrado." },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data, id: data.id });
  } catch (e: any) {
    const msg = e?.message ?? "Erro ao atualizar produto.";
    const status = msg.includes("ID inválido") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

/* ========================= PUT ========================= */

export async function PUT(req: NextRequest, ctx: Params) {
  try {
    const id = await parseId(ctx);
    const body = await req.json().catch(() => ({}));
    const payload = sanitizePayload(body, { strict: true });

    const { data, error } = await supabaseAdmin
      .from("produto")
      .update(payload)
      .eq("id", id)
      .select(PRODUTO_FIELDS)
      .single();

    if (error) {
      if ((error as any).code === "23505") {
        return NextResponse.json(
          { error: "Violação de unicidade (já cadastrado)." },
          { status: 409 }
        );
      }
      if ((error as any).code === "PGRST116") {
        return NextResponse.json(
          { error: "Produto não encontrado." },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data, id: data.id });
  } catch (e: any) {
    const msg = e?.message ?? "Erro ao atualizar produto.";
    const status =
      msg.includes("ID inválido") || msg.includes("Campos obrigatórios")
        ? 400
        : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

/* ========================= DELETE ========================= */

export async function DELETE(_: Request, ctx: Params) {
  try {
    const { id: idParam } = await ctx.params;
    const id = Number((idParam ?? "").trim());
    if (!id) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    // Com ON DELETE CASCADE em dependências (se houver), basta deletar o produto.
    const { data, error } = await supabaseAdmin
      .from("produto")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Erro ao deletar produto." },
      { status: 500 }
    );
  }
}
