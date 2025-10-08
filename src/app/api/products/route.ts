// src/app/api/v1/clientes/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/** Status de estoque (para filtros do GET) */
type Status = 'OK' | 'CRITICO' | 'BAIXO';
const STATUS_SET = new Set<Status>(['OK', 'CRITICO', 'BAIXO']);

/** Campos graváveis em produto */
const WRITABLE_FIELDS = new Set([
  'descricao',
  'precovenda',
  'estoque',
  'estoqueminimo',
  'ncm',
  'cfop',
  'unidade',
  'cest',
  'csosn',
  'aliquotaicms',
  'codigobarras',
  'referencia',
  'titulo',
  'fornecedor',
  'fabricante',
  'grupo',
]);

/** Campos a retornar ao criar/listar/atualizar se quiser o objeto completo */
const PRODUTO_FIELDS =
  'id, descricao, titulo, referencia, precovenda, estoque, estoqueminimo, unidade, ncm, cfop, csosn, cest, aliquotaicms, codigobarras, status_estoque, fornecedor, fabricante, grupo, createdat, updatedat';

function toNullIfEmpty(v: unknown) {
  return typeof v === 'string' && v.trim() === '' ? null : v;
}

function toNumberOrNull(v: any) {
  if (v == null || (typeof v === 'string' && v.trim() === '')) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Saneia e valida payload de produto */
function sanitizeProdutoPayload(body: any, { strict }: { strict: boolean }) {
  const out: Record<string, any> = {};

  for (const key of Object.keys(body ?? {})) {
    if (!WRITABLE_FIELDS.has(key)) continue;

    switch (key) {
      case 'precovenda':
      case 'aliquotaicms': {
        out[key] = toNumberOrNull(body[key]);
        break;
      }
      case 'estoque':
      case 'estoqueminimo': {
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
    const required = ['titulo', 'precovenda', 'estoque', 'estoqueminimo',];
    const missing = required.filter((k) => out[k] == null);
    if (missing.length) {
      throw new Error(`Campos obrigatórios ausentes: ${missing.join(', ')}`);
    }
  }

  const nowIso = new Date().toISOString();
  // createdat só no POST (se já vier do cliente, ignoramos)
  if (strict) out.createdat = nowIso;
  out.updatedat = nowIso;

  return out;
}

/* ========================= GET (lista paginada) ========================= */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(Number(searchParams.get('page') ?? 1), 1);
    const limitRaw =
      searchParams.get('limit') ?? searchParams.get('pageSize') ?? '20';
    const limit = Math.min(Math.max(Number(limitRaw), 1), 100);

    const q = (searchParams.get('search') ?? searchParams.get('q') ?? '').trim();

    const statusParam = (searchParams.get('status') ?? 'TODOS').toUpperCase();
    const statusFilter = STATUS_SET.has(statusParam as Status)
      ? (statusParam as Status)
      : null;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('produto')
      .select(
        `
        id, titulo, precovenda, estoque, estoqueminimo, unidade, referencia, status_estoque, fabricante, fornecedor
        `,
        { count: 'exact' }
      )
      .order('id', { ascending: false })
      .range(from, to);

    if (q) {
      query = query.or(
        `referencia.ilike.%${q}%,titulo.ilike.%${q}%,fornecedor.ilike.%${q}%,fabricante.ilike.%${q}%`
      );
    }

    if (statusFilter) {
      query = query.eq('status_estoque', statusFilter);
    }

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
      filters: { search: q },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Erro ao listar produtos' },
      { status: 500 }
    );
  }
}

/* ========================= POST (criar produto) ========================= */

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as any;
    console.log(body);
    const json =
      body?.newProduct && typeof body.newProduct === "object"
        ? body.newProduct
        : body;

    if (!json || typeof json !== "object") {
      return NextResponse.json(
        { error: "Corpo da requisição inválido." },
        { status: 400 }
      );
    }

    const payload = sanitizeProdutoPayload(json, { strict: true });

    // Deixe validações de ENUMs/constraints a cargo do banco (unidade, grupo, etc.)
    const { data, error } = await supabaseAdmin
      .from('produto')
      .insert(payload)
      .select(PRODUTO_FIELDS)
      .single();

    if (error) {
      // 23505 = unique_violation (ex.: se você criar UNIQUE em codigobarras)
      if ((error as any).code === '23505') {
        return NextResponse.json(
          { error: 'Violação de unicidade (já cadastrado).' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: (error as any).message ?? 'Erro ao criar produto.' },
        { status: 500 }
      );
    }

    // 201 Created
    return NextResponse.json({ data, id: data.id }, { status: 201 });
  } catch (e: any) {
    const msg =
      e?.message ??
      'Erro ao criar produto. Verifique os campos obrigatórios e os tipos.';
    const isBadReq =
      msg.includes('Campos obrigatórios ausentes') ||
      msg.toLowerCase().includes('obrigatório');
    return NextResponse.json({ error: msg }, { status: isBadReq ? 400 : 500 });
  }
}
