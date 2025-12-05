import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { mapEmpresaToEmitente } from '@/lib/nfe/mapEmpresaToEmitente';
import { buildEmitXml } from '@/lib/nfe/xmlEmitente';
import { validarEmitenteEmpresa } from '@/lib/nfe/validarEmitente';
import type { EmpresaRow } from '@/lib/nfe/types';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { ok: false, mensagem: 'ID inválido' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('empresa')
      .select('*')
      .eq('id', id)
      .single<EmpresaRow>();

    if (error) {
      console.error('Erro ao buscar empresa:', error);
      return NextResponse.json(
        { ok: false, mensagem: 'Erro ao buscar empresa', detalhe: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { ok: false, mensagem: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // 1) Validação dos campos obrigatórios do emitente
    const erros = validarEmitenteEmpresa(data);

    if (erros.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          tipo: 'VALIDACAO_EMITENTE',
          mensagem: 'Existem campos obrigatórios do emitente não preenchidos ou inválidos.',
          erros,
        },
        { status: 400 }
      );
    }

    // 2) Se passou na validação, mapeia para NFeEmitente
    // Por enquanto, vou fixar o nome do município aqui.
    // Se quiser, você pode adicionar uma coluna "nomemunicipio" na tabela e usar de lá.
    const emitente = mapEmpresaToEmitente(data, 'JOAO PESSOA');

    // 3) Gera XML <emit>
    const emitXml = buildEmitXml(emitente);

    return NextResponse.json({
      ok: true,
      emitente,
      emitXml,
    });
  } catch (e: any) {
    console.error('Erro em GET /api/nfe/emitente/[id]:', e);

    return NextResponse.json(
      {
        ok: false,
        mensagem: 'Erro interno ao montar emitente',
        detalhe: String(e?.message ?? e),
        stack: e?.stack ?? null,
      },
      { status: 500 }
    );
  }
}
