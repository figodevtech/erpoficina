// src/app/api/transacoes/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { params: Promise<{ id: string }> };

const TRANSACAO_FIELDS = `
  id, descricao, valor, data, metodopagamento, categoria, tipo, cliente_id,
  banco_id, nomepagador, cpfcnpjpagador, pendente, created_at, updated_at
`;

/** Campos do banco (bancoconta) alinhados ao que você precisa no front */
const BANCO_FIELDS =
  "id, titulo, tipo, agencia, contanumero, proprietario, valorinicial, empresa_id, created_at, updated_at";


const WRITABLE_FIELDS = new Set([
  "descricao",
  "valor",
  "data",
  "metodopagamento",
  "categoria",
  "tipo",
  "cliente_id",
  "banco_id",
  "nomepagador",
  "pendente",
  "cpfcnpjpagador",
]);

function toNullIfEmpty(v: unknown) {
  return typeof v === "string" && v.trim() === "" ? null : v;
}

function toNumberOrNull(v: any) {
  if (v == null || (typeof v === "string" && v.trim() === "")) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toTimestampOrNull(v: any) {
  if (v == null || (typeof v === "string" && v.trim() === "")) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * - Converte strings vazias para null
 * - Coerce campos numéricos para number (ou null)
 * - Converte datas para ISO (ou null)
 * - No PUT (strict=true) exige campos obrigatórios
 */
function sanitizePayload(body: any, { strict }: { strict: boolean }) {
  const out: Record<string, any> = {};

  for (const key of Object.keys(body ?? {})) {
    if (!WRITABLE_FIELDS.has(key)) continue;

    switch (key) {
      case "valor":
        out[key] = toNumberOrNull(body[key]);
        break;

      case "cliente_id":
      case "banco_id":
        out[key] = toNumberOrNull(body[key]);
        if (out[key] != null) out[key] = Math.trunc(out[key]);
        break;

      case "data":
        out[key] = toTimestampOrNull(body[key]);
        break;

      default:
        // descricao, metodopagamento, categoria, tipo, nomepagador, cpfcnpjpagador
        out[key] = toNullIfEmpty(body[key]);
    }
  }

  if (strict) {
    const required = [
      "descricao",
      "valor",
      "data",
      "metodopagamento",
      "categoria",
      "tipo",
      "banco_id",
      "nomepagador",
      "cpfcnpjpagador",
    ];
    const missing = required.filter((k) => out[k] == null);
    if (missing.length) {
      throw new Error(
        `Campos obrigatórios ausentes no PUT: ${missing.join(", ")}`
      );
    }
  }

  // Deixe enums serem validados pelo Postgres
  out.updated_at = new Date().toISOString();
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
      .from("transacao")
      .select(
        `
        ${TRANSACAO_FIELDS},
        banco:bancoconta!transacao_banco_id_fkey ( ${BANCO_FIELDS} )
        `,
        { count: "exact" }
      )
      .eq("id", id)
      .single();

    if (error) {
      if ((error as any).code === "PGRST116") {
        return NextResponse.json(
          { error: "Transação não encontrada." },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    const msg = e?.message ?? "Erro ao buscar transação.";
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

    if (Object.keys(payload).length === 1 && "updated_at" in payload) {
      return NextResponse.json(
        { error: "Nada para atualizar." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("transacao")
      .update(payload)
      .eq("id", id)
      .select(TRANSACAO_FIELDS)
      .single();

    if (error) {
      const code = (error as any).code;
      if (code === "PGRST116") {
        return NextResponse.json(
          { error: "Transação não encontrada." },
          { status: 404 }
        );
      }
      if (code === "23503") {
        // FK (cliente_id/banco_id) inválida
        return NextResponse.json(
          { error: "Chave estrangeira inválida (cliente_id/banco_id)." },
          { status: 422 }
        );
      }
      if (code === "22P02") {
        // enum inválido / formato inválido
        return NextResponse.json(
          { error: "Formato inválido em um ou mais campos." },
          { status: 400 }
        );
      }
      if (code === "23505") {
        // Não esperado aqui, mas se existir alguma UNIQUE no futuro
        return NextResponse.json(
          { error: "Violação de unicidade (já cadastrado)." },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data, id: data.id });
  } catch (e: any) {
    const msg = e?.message ?? "Erro ao atualizar transação.";
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
      .from("transacao")
      .update(payload)
      .eq("id", id)
      .select(TRANSACAO_FIELDS)
      .single();

    if (error) {
      const code = (error as any).code;
      if (code === "PGRST116") {
        return NextResponse.json(
          { error: "Transação não encontrada." },
          { status: 404 }
        );
      }
      if (code === "23503") {
        return NextResponse.json(
          { error: "Chave estrangeira inválida (cliente_id/banco_id)." },
          { status: 422 }
        );
      }
      if (code === "22P02") {
        return NextResponse.json(
          { error: "Formato inválido em um ou mais campos." },
          { status: 400 }
        );
      }
      if (code === "23505") {
        return NextResponse.json(
          { error: "Violação de unicidade (já cadastrado)." },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data, id: data.id });
  } catch (e: any) {
    const msg = e?.message ?? "Erro ao atualizar transação.";
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

    const { data, error } = await supabaseAdmin
      .from("transacao")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Transação não encontrada." },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Erro ao deletar transação." },
      { status: 500 }
    );
  }
}
