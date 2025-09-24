// src/app/api/v1/clientes/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Status = 'OK' | 'CRITICO' | 'BAIXO';
const STATUS_SET = new Set<Status>(['OK', 'CRITICO', 'BAIXO']);


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
      .from('produto')
      .select(
        `
        id, codigo, descricao, precounitario, estoque, estoqueminimo, unidade,origem, referencia, titulo, status_estoque
        `,
        { count: 'exact' }
      )
      .order('id', { ascending: false })
      .range(from, to);

    if (q) {
      query = query.or(
        `codigo.ilike.%${q}%,descricao.ilike.%${q}%,referencia.ilike.%${q}%,titulo.ilike.%${q}%`
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

    // 🔹 novos campos úteis
    const pageCount = items.length;                   // quantos itens vieram nesta página
    const hasPrevPage = page > 1;
    const hasNextPage = page * limit < total;

    return NextResponse.json({
      data: items,
      pagination: {
        total,         // total de registros considerando os filtros
        page,          // página atual
        limit,         // limite solicitado
        totalPages,    // total de páginas
        pageCount,     // 🔹 quantidade de itens na página atual
        hasPrevPage,   // 🔹 boolean de navegação
        hasNextPage,   // 🔹 boolean de navegação
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
