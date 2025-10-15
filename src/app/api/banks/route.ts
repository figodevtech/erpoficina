// src/app/api/v1/bancos/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/** Campos graváveis em bancoconta */
const WRITABLE_FIELDS = new Set([
  "titulo",
  "valorinicial",
  "agencia",
  "contanumero",
  "tipo",
  "proprietario",
  "empresa_id",
]);

/** Campos retornados no select padrão (bancoconta) */
const BANCO_FIELDS =
  "id, titulo, tipo, agencia, contanumero, proprietario, valorinicial, empresa_id, created_at, updated_at";

/* ========================= Helpers ========================= */

function toNullIfEmpty(v: unknown) {
  return typeof v === "string" && v.trim() === "" ? null : v;
}

function toNumberOrNull(v: any) {
  if (v == null || (typeof v === "string" && v.trim() === "")) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Saneia e valida payload de bancoconta:
 * - strings vazias -> null
 * - valorinicial (real), empresa_id (int) -> number
 * - no POST (strict=true) exige obrigatórios mínimos
 */
function sanitizeBancoPayload(body: any, { strict }: { strict: boolean }) {
  const out: Record<string, any> = {};

  for (const key of Object.keys(body ?? {})) {
    if (!WRITABLE_FIELDS.has(key)) continue;

    switch (key) {
      case "valorinicial": {
        out[key] = toNumberOrNull(body[key]);
        break;
      }
      case "empresa_id": {
        const n = toNumberOrNull(body[key]);
        out[key] = n == null ? null : Math.trunc(n);
        break;
      }
      default: {
        out[key] = toNullIfEmpty(body[key]);
      }
    }
  }

  if (strict) {
    // Conforme o schema: titulo (NOT NULL), valorinicial (NOT NULL).
    const required = ["titulo", "valorinicial"];
    const missing = required.filter((k) => out[k] == null);
    if (missing.length) {
      throw new Error(`Campos obrigatórios ausentes: ${missing.join(", ")}`);
    }
  }

  const nowIso = new Date().toISOString();
  if (strict) out.created_at = nowIso;
  out.updated_at = nowIso;

  return out;
}

/* ========================= GET (lista paginada + filtros) ========================= */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const limitRaw =
      searchParams.get("limit") ?? searchParams.get("pageSize") ?? "20";
    const limit = Math.min(Math.max(Number(limitRaw), 1), 100);

    const q = (searchParams.get("search") ?? searchParams.get("q") ?? "")
      .trim()
      .slice(0, 200);

    // Filtros opcionais
    const tipo = (searchParams.get("tipo") ?? "").trim(); // public.banco_tipo
    const empresaId = toNumberOrNull(searchParams.get("empresaId"));

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("bancoconta")
      .select(`${BANCO_FIELDS}`, { count: "exact" })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);

    if (q) {
      // Busca em múltiplos campos textuais
      // Obs.: a sintaxe do .or usa vírgulas entre condições
      query = query.or(
        [
          `titulo.ilike.%${q}%`,
          `agencia.ilike.%${q}%`,
          `contanumero.ilike.%${q}%`,
          `proprietario.ilike.%${q}%`,
        ].join(",")
      );
    }

    if (tipo) query = query.eq("tipo", tipo);
    if (empresaId != null) query = query.eq("empresa_id", empresaId);

    const { data, error, count } = await query;
    if (error) throw error;

    const items = data ?? [];
    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const pageCount = items.length;
    const hasPrevPage = page > 1;
    const hasNextPage = page * limit < total;

    return NextResponse.json({
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        pageCount,
        hasPrevPage,
        hasNextPage,
      },
      filters: {
        search: q,
        tipo: tipo || null,
        empresaId: empresaId ?? null,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erro ao listar contas/bancos" },
      { status: 500 }
    );
  }
}

/* ========================= POST (criar conta/banco) ========================= */

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as any;

    // Aceita payload bruto ou { newBank: {...} }
    const json =
      body?.newBank && typeof body.newBank === "object" ? body.newBank : body;

    if (!json || typeof json !== "object") {
      return NextResponse.json(
        { error: "Corpo da requisição inválido." },
        { status: 400 }
      );
    }

    const payload = sanitizeBancoPayload(json, { strict: true });

    const { data, error } = await supabaseAdmin
      .from("bancoconta")
      .insert(payload)
      .select(`${BANCO_FIELDS}`)
      .single();

    if (error) {
      // 23503 = foreign_key_violation (empresa_id)
      if ((error as any).code === "23503") {
        return NextResponse.json(
          {
            error:
              "Violação de chave estrangeira. Verifique se empresa_id existe.",
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: (error as any).message ?? "Erro ao criar conta/banco." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, id: data.id }, { status: 201 });
  } catch (e: any) {
    const msg =
      e?.message ??
      "Erro ao criar conta/banco. Verifique os campos obrigatórios e os tipos.";
    const isBadReq =
      msg.includes("Campos obrigatórios ausentes") ||
      msg.toLowerCase().includes("obrigatório");
    return NextResponse.json({ error: msg }, { status: isBadReq ? 400 : 500 });
  }
}
