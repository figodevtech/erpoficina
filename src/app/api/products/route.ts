// src/app/api/v1/clientes/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // usa a SERVICE_ROLE_KEY

// GET /api/v1/clientes?page=1&pageSize=20&q=ana
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get('page') ?? 1), 1);
    const pageSize = Math.min(Math.max(Number(searchParams.get('pageSize') ?? 20), 1), 100);
    const q = (searchParams.get('q') ?? '').trim();

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // base query
    let query = supabaseAdmin
      .from('produto')
      .select(
        `
        id, codigo, titulo, descricao, precounitario, estoque, estoqueminimo, unidade, origem, referencia
        `,
        { count: 'exact' } // pede o total
      )
      .order('createdat', { ascending: false })
      .range(from, to);

    // filtro de busca (OR ilike em vários campos)
    if (q) {
      query = query.or(
        `codigo.ilike.%${q}%,descricao.ilike.%${q}%,email.ilike.%${q}%,telefone.ilike.%${q}%`
      );
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      data: data ?? [],
      meta: {
        page,
        pageSize,
        total: count ?? 0,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao listar clientes' }, { status: 500 });
  }
}

// POST /api/v1/clientes
export async function POST(req: Request) {
  try {
    const b = await req.json();

    if (!b?.tipopessoa || !['FISICA', 'JURIDICA'].includes(b.tipopessoa)) {
      return NextResponse.json({ error: 'tipopessoa deve ser FISICA ou JURIDICA' }, { status: 400 });
    }
    if (!b?.cpfcnpj || !b?.nomerazaosocial) {
      return NextResponse.json({ error: 'cpfcnpj e nomerazaosocial são obrigatórios' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('cliente')
      .insert([
        {
          tipopessoa: b.tipopessoa,
          cpfcnpj: b.cpfcnpj,
          nomerazaosocial: b.nomerazaosocial,
          email: b.email ?? null,
          telefone: b.telefone ?? null,
          endereco: b.endereco ?? null,
          cidade: b.cidade ?? null,
          estado: b.estado ?? null,
          cep: b.cep ?? null,
          inscricaoestadual: b.inscricaoestadual ?? null,
          inscricaomunicipal: b.inscricaomunicipal ?? null,
          codigomunicipio: b.codigomunicipio ?? null,
        },
      ])
      .select(
        `
        id, tipopessoa, cpfcnpj, nomerazaosocial, email, telefone, endereco,
        cidade, estado, cep, inscricaoestadual, inscricaomunicipal, codigomunicipio,
        createdat, updatedat
        `
      )
      .single();

    if (error) {
      // unique_violation (cpfcnpj) vem do Postgres; Supabase repassa em error.message
      if (String(error.message).toLowerCase().includes('duplicate key')) {
        return NextResponse.json({ error: 'cpfcnpj já cadastrado' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao criar cliente' }, { status: 500 });
  }
}
