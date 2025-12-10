import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

type NfeRow = {
  id: number;
  status: string;
  empresaid: number | null;
};

async function deletarRascunhoHandler(_req: Request, nfeIdParam: string) {
  try {
    const nfeId = Number(nfeIdParam);

    if (Number.isNaN(nfeId)) {
      return NextResponse.json(
        { ok: false, mensagem: 'ID de NF-e inválido.' },
        { status: 400 },
      );
    }

    // 1) Buscar NF-e no banco
    const { data: nfe, error: nfeError } = await supabaseAdmin
      .from('nfe')
      .select('*')
      .eq('id', nfeId)
      .maybeSingle<NfeRow>();

    if (nfeError) {
      console.error('[nfe/deletar-rascunho] erro ao buscar NF-e:', nfeError);
      return NextResponse.json(
        {
          ok: false,
          mensagem: 'Erro ao buscar NF-e no banco.',
          detalhe: nfeError.message,
        },
        { status: 500 },
      );
    }

    if (!nfe) {
      return NextResponse.json(
        { ok: false, mensagem: 'NF-e não encontrada.' },
        { status: 404 },
      );
    }

    // 2) Só permite excluir se estiver em RASCUNHO
    if ((nfe.status || '').toUpperCase() !== 'RASCUNHO') {
      return NextResponse.json(
        {
          ok: false,
          mensagem:
            'Somente NF-e com status RASCUNHO pode ser excluída do banco.',
          statusAtual: nfe.status,
        },
        { status: 400 },
      );
    }

    // 3) Excluir de fato
    const { error: deleteError } = await supabaseAdmin
      .from('nfe')
      .delete()
      .eq('id', nfeId);

    if (deleteError) {
      console.error(
        '[nfe/deletar-rascunho] erro ao excluir NF-e:',
        deleteError,
      );
      return NextResponse.json(
        {
          ok: false,
          mensagem: 'Erro ao excluir NF-e em rascunho.',
          detalhe: deleteError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      nfeId,
      mensagem: 'NF-e em rascunho excluída com sucesso.',
    });
  } catch (e: any) {
    console.error('Erro em /api/nfe/deletar-rascunho/[id]:', e);
    return NextResponse.json(
      {
        ok: false,
        mensagem: 'Erro interno ao excluir NF-e em rascunho.',
        detalhe: String(e?.message ?? e),
        stack: e?.stack ?? null,
      },
      { status: 500 },
    );
  }
}

// Next 15: params é Promise
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  return deletarRascunhoHandler(req, id);
}
