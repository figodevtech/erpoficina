export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/** Campos graváveis em transacao */
const WRITABLE_FIELDS = new Set([
  "ordemservicoid",
  "descricao",
  "valor",
  "valorLiquido",
  "data",
  "metodopagamento",
  "categoria",
  "tipo",
  "cliente_id",
  "banco_id",
  "nomepagador",
  "cpfcnpjpagador",
  "pendente",
]);

const FORTALEZA_OFFSET = "-03:00";

// Converte "YYYY-MM-DD" 00:00 (Fortaleza) -> ISO UTC
function localDayStartToUtcIso(dateStr: string) {
  return new Date(`${dateStr}T00:00:00${FORTALEZA_OFFSET}`).toISOString();
}

// Converte início do dia seguinte local -> ISO UTC
function localNextDayStartToUtcIso(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00${FORTALEZA_OFFSET}`);
  return new Date(d.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

/** Campos retornados no select padrão (transacao) */
const TRANSACAO_FIELDS =
  "id, descricao, valor, valorLiquido, pendente, data, ordemservicoid, metodopagamento, categoria, tipo, cliente_id, banco_id, created_at, updated_at";

/** Campos do banco (bancoconta) alinhados ao que você precisa no front */
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

function toDateISOStringOrNull(v: any) {
  if (v == null || (typeof v === "string" && v.trim() === "")) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function parseBooleanParam(v: string | null): boolean | null {
  if (v == null) return null;
  const s = v.trim().toLowerCase();
  if (s === "true" || s === "1" || s === "yes") return true;
  if (s === "false" || s === "0" || s === "no") return false;
  return null;
}

/**
 * Saneia e valida payload de transacao:
 * - strings vazias -> null
 * - valor (real), banco_id (bigint), cliente_id (int) -> number
 * - data (timestamp tz) -> ISO string
 * - no POST (strict=true) exige obrigatórios
 */
function sanitizeTransacaoPayload(body: any, { strict }: { strict: boolean }) {
  const out: Record<string, any> = {};

  for (const key of Object.keys(body ?? {})) {
    if (!WRITABLE_FIELDS.has(key)) continue;

    switch (key) {
      case "valor": {
        out[key] = toNumberOrNull(body[key]);
        break;
      }
      case "valorLiquido": {
        out[key] = toNumberOrNull(body[key]);
        break;
      }
      case "banco_id": {
        out[key] = toNumberOrNull(body[key]);
        break;
      }
      case "cliente_id": {
        const n = toNumberOrNull(body[key]);
        out[key] = n == null ? null : Math.trunc(n);
        break;
      }
      case "data": {
        out[key] = toDateISOStringOrNull(body[key]);
        break;
      }
      case "pendente": {
        const pb = parseBooleanParam(String(body[key]));
        out[key] = pb ?? body[key]; // mantém compatibilidade se vier boolean já tipado
        break;
      }
      default: {
        out[key] = toNullIfEmpty(body[key]);
      }
    }
  }

  if (strict) {
    const required = ["descricao", "valor", "data", "metodopagamento", "categoria", "tipo", "banco_id"];
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

    const limitRaw = searchParams.get("limit") ?? searchParams.get("pageSize") ?? "20";
    // ✅ permite o dashboard pedir 1000
    const limit = Math.min(Math.max(Number(limitRaw), 1), 1000);

    const q = (searchParams.get("search") ?? searchParams.get("q") ?? "").trim().slice(0, 200);

    // Filtros opcionais
    const tipo = (searchParams.get("tipo") ?? "").trim();
    const categoria = (searchParams.get("categoria") ?? "").trim();
    const ordemservicoid = searchParams.get("ordemservicoid");
    const vendaid = searchParams.get("vendaid");

    const metodo = (searchParams.get("metodo") ?? searchParams.get("metodopagamento") ?? "").trim();
    const bancoId = toNumberOrNull(searchParams.get("bancoId"));
    const clienteId = toNumberOrNull(searchParams.get("clienteId"));

    // ✅ pendente boolean real
    const pendenteBool = parseBooleanParam(searchParams.get("pendente"));

    // Intervalo de datas (inclusive)
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("transacao")
      .select(
        `
        ${TRANSACAO_FIELDS},
        banco:bancoconta!transacao_banco_id_fkey ( ${BANCO_FIELDS} )
        `,
        { count: "exact" }
      )
      .order("data", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);

    if (q) query = query.ilike("descricao", `%${q}%`);
    if (ordemservicoid) query = query.eq("ordemservicoid", ordemservicoid);
    if (vendaid) query = query.eq("vendaid", vendaid);
    if (tipo) query = query.eq("tipo", tipo);
    if (categoria) query = query.eq("categoria", categoria);
    if (metodo) query = query.eq("metodopagamento", metodo);
    if (bancoId != null) query = query.eq("banco_id", bancoId);
    if (clienteId != null) query = query.eq("cliente_id", clienteId);

    // ✅ agora funciona com pendente=false
    if (pendenteBool !== null) query = query.eq("pendente", pendenteBool);

    if (dateFrom) query = query.gte("data", localDayStartToUtcIso(dateFrom));
    if (dateTo) query = query.lt("data", localNextDayStartToUtcIso(dateTo));

    const { data, error, count } = await query;
    if (error) throw error;

    const items = data ?? [];
    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const pageCount = items.length;

    return NextResponse.json({
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        pageCount,
        hasPrevPage: page > 1,
        hasNextPage: page * limit < total,
      },
      filters: {
        search: q,
        tipo: tipo || null,
        categoria: categoria || null,
        metodopagamento: metodo || null,
        bancoId: bancoId ?? null,
        clienteId: clienteId ?? null,
        pendente: pendenteBool,
        dateFrom: dateFrom ?? null,
        dateTo: dateTo ?? null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro ao listar transações" }, { status: 500 });
  }
}

/* ========================= POST (criar transacao) ========================= */

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as any;

    // Aceita payload bruto ou { newTransaction: {...} }
    const json = body?.newTransaction && typeof body.newTransaction === "object" ? body.newTransaction : body;

    if (!json || typeof json !== "object") {
      return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
    }

    const payload = sanitizeTransacaoPayload(json, { strict: true });

    const { data, error } = await supabaseAdmin
      .from("transacao")
      .insert(payload)
      .select(
        `
        ${TRANSACAO_FIELDS},
        banco:bancoconta!transacao_banco_id_fkey ( ${BANCO_FIELDS} )
        `
      )
      .single();

    if (error) {
      if ((error as any).code === "23503") {
        const msg = (error as any).message ?? "Violação de chave estrangeira. Verifique banco_id e cliente_id.";
        const detail = (error as any).details || (error as any).hint || "";
        const isBanco = /banco/i.test(msg + " " + detail);
        const isCliente = /cliente/i.test(msg + " " + detail);

        return NextResponse.json(
          {
            error: isBanco
              ? "Conta bancária (banco_id) inexistente."
              : isCliente
              ? "Cliente (cliente_id) inexistente."
              : "Referência inválida: banco_id/cliente_id.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: (error as any).message ?? "Erro ao criar transação." }, { status: 500 });
    }

    return NextResponse.json({ data, id: data.id }, { status: 201 });
  } catch (e: any) {
    const msg = e?.message ?? "Erro ao criar transação. Verifique os campos obrigatórios e os tipos.";
    const isBadReq = msg.includes("Campos obrigatórios ausentes") || msg.toLowerCase().includes("obrigatório");
    return NextResponse.json({ error: msg }, { status: isBadReq ? 400 : 500 });
  }
}
