// src/app/api/nfe/de-os/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const osId = Number(params.id);

  if (!osId || Number.isNaN(osId)) {
    return NextResponse.json(
      { ok: false, message: 'ID de OS inválido' },
      { status: 400 },
    );
  }

  try {
    // 1) Criar cabeçalho da NF-e (tabela nfe) a partir da OS
    const { data: criarData, error: criarError } = await supabaseAdmin.rpc(
      'criar_nfe_de_os',
      {
        p_ordemservicoid: osId,
      },
    );

    if (criarError) {
      console.error('[criar_nfe_de_os] erro:', criarError);
      return NextResponse.json(
        {
          ok: false,
          message: 'Erro ao criar NF-e a partir da OS',
          detalhe: criarError.message,
        },
        { status: 500 },
      );
    }

    const nfeId: number | null =
      Array.isArray(criarData) ? criarData[0] : criarData;

    if (!nfeId) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Função criar_nfe_de_os não retornou id',
        },
        { status: 500 },
      );
    }

    // 2) Preencher itens na nfe_item com base em osproduto/produto
    const { error: itensError } = await supabaseAdmin.rpc(
      'preencher_itens_nfe_de_os',
      {
        p_nfe_id: nfeId,
      },
    );

    if (itensError) {
      console.error('[preencher_itens_nfe_de_os] erro:', itensError);
      return NextResponse.json(
        {
          ok: false,
          message: 'Erro ao preencher itens da NF-e',
          detalhe: itensError.message,
        },
        { status: 500 },
      );
    }

    // 3) Atualizar totais da NF-e
    const { error: totalError } = await supabaseAdmin.rpc(
      'atualizar_totais_nfe',
      {
        p_nfe_id: nfeId,
      },
    );

    if (totalError) {
      console.error('[atualizar_totais_nfe] erro:', totalError);
      return NextResponse.json(
        {
          ok: false,
          message: 'Erro ao atualizar totais da NF-e',
          detalhe: totalError.message,
        },
        { status: 500 },
      );
    }

    // 4) Buscar a NF-e pronta pra devolver pro front (opcional, mas ajuda)
    const { data: nfe, error: nfeError } = await supabaseAdmin
      .from('nfe')
      .select(
        `
        id,
        modelo,
        serie,
        numero,
        chave_acesso,
        ambiente,
        status,
        ordemservicoid,
        vendaid,
        clienteid,
        dataemissao,
        total_produtos,
        total_servicos,
        total_nfe
      `,
      )
      .eq('id', nfeId)
      .maybeSingle();

    if (nfeError) {
      console.error('[select nfe] erro:', nfeError);
    }

    return NextResponse.json(
      {
        ok: true,
        message: 'NF-e criada a partir da OS com sucesso',
        nfeId,
        nfe,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error('[api/nfe/de-os] erro inesperado', err);
    return NextResponse.json(
      {
        ok: false,
        message: 'Erro interno ao criar NF-e',
        detalhe: err?.message ?? String(err),
      },
      { status: 500 },
    );
  }
}
