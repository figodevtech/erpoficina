// src/app/api/pdv/products/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/** Status de estoque (para filtros do GET) */
type Status = 'OK' | 'CRITICO' | 'BAIXO' | 'SEM_ESTOQUE';
const STATUS_SET = new Set<Status>(['OK', 'CRITICO', 'BAIXO', 'SEM_ESTOQUE']);

/** Campos graváveis em produto */

/* ========================= GET (lista completa, sem paginação) ========================= */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get('search') ?? searchParams.get('q') ?? '').trim();

    const statusParam = (searchParams.get('status') ?? 'TODOS').toUpperCase();
    const statusFilter = STATUS_SET.has(statusParam as Status)
      ? (statusParam as Status)
      : null;

    let query = supabaseAdmin
      .from('produto')
      .select(
        `
        id, titulo, precovenda, estoque, estoqueminimo, unidade, referencia, status_estoque, fabricante, fornecedor, grupo, imgUrl, exibirPdv, tituloMarketplace, descricaoMarketplace
        `
      )
      .order('id', { ascending: false });

    if (q) {
      query = query.or(
        `referencia.ilike.%${q}%,titulo.ilike.%${q}%,fornecedor.ilike.%${q}%,fabricante.ilike.%${q}%`
      );
    }

    query = query.eq('exibirPdv', true);

    if (statusFilter) {
      query = query.eq('status_estoque', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    const items = data ?? [];

    return NextResponse.json({
      data: items,
      filters: { search: q },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Erro ao listar produtos' },
      { status: 500 }
    );
  }
}

