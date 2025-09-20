// src/app/api/customers/[id]/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Params = { params: Promise<{ id: string }> };

const SELECT_FIELDS = `
  id, tipopessoa, cpfcnpj, nomerazaosocial, email, telefone, endereco,
  cidade, estado, cep, inscricaoestadual, inscricaomunicipal, codigomunicipio,
  createdat, updatedat, status
`;

export async function GET(_: Request, ctx: Params) {
  try {
    const { id: idParam } = await ctx.params; // ⬅️ precisa await
    const raw = (idParam ?? '').trim();

    if (!raw || isNaN(Number(raw))) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    const id = Number(raw);

    const { data, error } = await supabaseAdmin
      .from('cliente')
      .select(SELECT_FIELDS)
      .eq('id', id)
      .single();

    if (error) {
      // PGRST116 = nenhum registro para single()
      if ((error as any).code === 'PGRST116') {
        return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Erro ao buscar cliente.' },
      { status: 500 }
    );
  }
}
