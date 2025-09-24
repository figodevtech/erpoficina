// src/app/api/clientes/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Status = 'ATIVO' | 'INATIVO' | 'PENDENTE';
const STATUS_SET = new Set<Status>(['ATIVO', 'INATIVO', 'PENDENTE']);

const REQUIRED_FIELDS = ['tipopessoa', 'cpfcnpj', 'nomerazaosocial'] as const;

type Payload = {
  tipopessoa: 'FISICA' | 'JURIDICA' | string;
  cpfcnpj: string;
  nomerazaosocial: string;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  inscricaoestadual?: string | null;
  inscricaomunicipal?: string | null;
  codigomunicipio?: string | null;
  status?: Status | string | null;
};

function onlyDigits(v?: string | null) {
  return (v ?? '').replace(/\D+/g, '');
}
function normalizeString(v?: string | null) {
  const s = (v ?? '').trim();
  return s.length ? s : null;
}
function normalizeUF(v?: string | null) {
  const s = normalizeString(v);
  return s ? s.toUpperCase().slice(0, 2) : null;
}
function normalizeTipopessoa(v?: string | null) {
  const s = normalizeString(v);
  if (!s) return null;
  const up = s.toUpperCase();
  return up === 'FISICA' || up === 'JURIDICA' ? up : null;
}

/* ============================
   GET /api/clientes  (listar)
   ============================ */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(Number(searchParams.get('page') ?? 1), 1);
    const limitRaw = searchParams.get('limit') ?? searchParams.get('pageSize') ?? '20';
    const limit = Math.min(Math.max(Number(limitRaw), 1), 100);

    const q = (searchParams.get('search') ?? searchParams.get('q') ?? '').trim();

    const statusParam = (searchParams.get('status') ?? 'TODOS').toUpperCase();
    const statusFilter = STATUS_SET.has(statusParam as Status) ? (statusParam as Status) : null;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('cliente')
      .select(
        `
        id, tipopessoa, cpfcnpj, nomerazaosocial, email, telefone, endereco,
        cidade, estado, cep, inscricaoestadual, inscricaomunicipal, codigomunicipio,
        createdat, updatedat, status
        `,
        { count: 'exact' }
      )
      .order('id', { ascending: false })
      .range(from, to);

    if (q) {
      query = query.or(
        `nomerazaosocial.ilike.%${q}%,cpfcnpj.ilike.%${q}%,email.ilike.%${q}%,telefone.ilike.%${q}%`
      );
    }

    if (statusFilter) {
      query = query.eq('status', statusFilter);
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
      filters: { search: q, status: statusFilter ?? 'TODOS' },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Erro ao listar clientes' },
      { status: 500 }
    );
  }
}

/* ============================
   POST /api/clientes  (criar)
   ============================ */
export async function POST(req: Request) {
  try {
    const json = (await req.json()) as Partial<Payload> | null;

    if (!json || typeof json !== 'object') {
      return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
    }

    // valida obrigatórios
    const missing = REQUIRED_FIELDS.filter((k) => !json[k] || String(json[k]).trim() === '');
    if (missing.length) {
      return NextResponse.json(
        { error: `Campos obrigatórios ausentes: ${missing.join(', ')}.` },
        { status: 400 }
      );
    }

    // normalizações
    const tipopessoa = normalizeTipopessoa(String(json.tipopessoa));
    if (!tipopessoa) {
      return NextResponse.json(
        { error: "Valor de 'tipopessoa' inválido. Use 'FISICA' ou 'JURIDICA'." },
        { status: 400 }
      );
    }

    const cpfcnpj = onlyDigits(String(json.cpfcnpj));
    if (!cpfcnpj) {
      return NextResponse.json({ error: 'cpfcnpj inválido.' }, { status: 400 });
    }

    const payload = {
      tipopessoa,
      cpfcnpj,
      nomerazaosocial: String(json.nomerazaosocial).trim(),
      email: normalizeString(json.email ?? null),
      telefone: normalizeString(json.telefone ?? null),
      endereco: normalizeString(json.endereco ?? null),
      cidade: normalizeString(json.cidade ?? null),
      estado: normalizeUF(json.estado ?? null),
      cep: onlyDigits(json.cep ?? null) || null,
      inscricaoestadual: normalizeString(json.inscricaoestadual ?? null),
      inscricaomunicipal: normalizeString(json.inscricaomunicipal ?? null),
      codigomunicipio: normalizeString(json.codigomunicipio ?? null),
      status: (normalizeString(json.status ?? null) as Status | null) ?? null, // deixe o default do banco agir se null
    };

    const { data, error } = await supabaseAdmin
      .from('cliente')
      .insert(payload)
      .select(
        `
        id, tipopessoa, cpfcnpj, nomerazaosocial, email, telefone, endereco,
        cidade, estado, cep, inscricaoestadual, inscricaomunicipal, codigomunicipio,
        createdat, updatedat, status
        `
      )
      .single();

    if (error) {
      // 23505 = unique_violation (cpfcnpj)
      if ((error as any).code === '23505') {
        return NextResponse.json(
          { error: 'Já existe um cliente com esse CPF/CNPJ.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: (error as any).message ?? 'Erro ao salvar cliente.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Erro ao salvar cliente.' },
      { status: 500 }
    );
  }
}
