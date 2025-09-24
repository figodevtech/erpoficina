// src/app/api/clientes/[id]/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Params = { params: Promise<{ id: string }> };

const CLIENTE_FIELDS = `
  id, tipopessoa, cpfcnpj, nomerazaosocial, email, telefone, endereco,
  cidade, estado, cep, inscricaoestadual, inscricaomunicipal, codigomunicipio,
  createdat, updatedat, status
`;

const VEICULO_FIELDS = `
  id, clienteid, placa, modelo, marca, ano, cor, kmatual, createdat, updatedat
`;

export async function GET(_: Request, ctx: Params) {
  try {
    const { id: idParam } = await ctx.params;
    const id = Number((idParam ?? '').trim());
    if (!id) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('cliente')
      .select(
        `
        ${CLIENTE_FIELDS},
        veiculos:veiculo ( ${VEICULO_FIELDS} )
        `
      )
      .eq('id', id)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Erro ao buscar cliente.' },
      { status: 500 }
    );
  }
}


export async function DELETE(_: Request, ctx: Params) {
  try {
    const { id: idParam } = await ctx.params;
    const id = Number((idParam ?? '').trim());

    if (!id) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    // Primeiro exclui os veículos do cliente (para respeitar o FK)
    const { error: veicErr } = await supabaseAdmin
      .from('veiculo')
      .delete()
      .eq('clienteid', id);

    if (veicErr) throw veicErr;

    // Agora exclui o cliente
    const { error: cliErr } = await supabaseAdmin
      .from('cliente')
      .delete()
      .eq('id', id);

    if (cliErr) throw cliErr;

    return NextResponse.json({ success: true, message: 'Cliente deletado com sucesso.' },{status: 201});
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Erro ao deletar cliente.' },
      { status: 500 }
    );
  }
}