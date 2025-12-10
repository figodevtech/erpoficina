import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { mapEmpresaToEmitente } from '@/lib/nfe/mapEmpresaToEmitente';
import { buildEmitXml } from '@/lib/nfe/xmlEmitente';
import { validarEmitenteEmpresa } from '@/lib/nfe/validarEmitente';
import type { EmpresaRow } from '@/lib/nfe/types';

export const runtime = 'nodejs';

type Contexto = { params: Promise<{ id: string }> };

export async function GET(
  _req: NextRequest,
  { params }: Contexto
) {
  try {
    const { id } = await params;
    const idNumber = Number(id);

    if (Number.isNaN(idNumber)) {
      return NextResponse.json(
        { ok: false, mensagem: 'ID inválido' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('empresa')
      .select('*')
      .eq('id', idNumber)
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

    const emitente = mapEmpresaToEmitente(data, 'JOAO PESSOA');
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
