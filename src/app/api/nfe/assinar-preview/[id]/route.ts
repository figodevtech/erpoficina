import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { EmpresaRow } from '@/lib/nfe/types';
import { validarEmitenteEmpresa } from '@/lib/nfe/validarEmitente';
import { buildNFePreviewXml } from '@/lib/nfe/buildNFe';
import { carregarCertificadoA1 } from '@/lib/nfe/certificado';
import { assinarNFeXml } from '@/lib/nfe/assinatura';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
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

    const url = new URL(req.url);
    const numeroParam = url.searchParams.get('numero') ?? '1';
    const serieParam = url.searchParams.get('serie') ?? '1';

    const numeroNota = Number(numeroParam);
    const serie = Number(serieParam);

    if (Number.isNaN(numeroNota) || Number.isNaN(serie)) {
      return NextResponse.json(
        { ok: false, mensagem: 'Parâmetros numero e serie devem ser numéricos.' },
        { status: 400 }
      );
    }

    // 1) Carregar empresa
    const { data: empresa, error } = await supabaseAdmin
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

    if (!empresa) {
      return NextResponse.json(
        { ok: false, mensagem: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // 2) Validar emitente
    const errosEmitente = validarEmitenteEmpresa(empresa);
    if (errosEmitente.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          tipo: 'VALIDACAO_EMITENTE',
          mensagem: 'Emitente com dados incompletos para emitir NF-e.',
          erros: errosEmitente,
        },
        { status: 400 }
      );
    }

    // 3) Gerar XML da NF-e (sem assinatura)
    const { xml: xmlOriginal, chave, id: idNFe } = buildNFePreviewXml(
      empresa,
      numeroNota,
      serie
    );

    // 4) Checar se tem caminho e senha do certificado
    if (!empresa.certificadocaminho || !empresa.certificadosenha) {
      return NextResponse.json(
        {
          ok: false,
          tipo: 'CERTIFICADO_INCOMPLETO',
          mensagem:
            'certificadocaminho e certificadosenha precisam estar preenchidos na tabela empresa.',
        },
        { status: 400 }
      );
    }

    // 5) Carregar chave privada + certificado a partir do PFX
    const { chavePrivadaPem, certificadoPem } = carregarCertificadoA1(
      empresa.certificadocaminho,
      empresa.certificadosenha
    );

    // 6) Assinar XML
    const xmlAssinado = assinarNFeXml (
      xmlOriginal,
      chavePrivadaPem,
      certificadoPem
    );

    return NextResponse.json({
      ok: true,
      chave,
      idNFe,
      xmlOriginal,
      xmlAssinado,
    });
  } catch (e: any) {
    console.error('Erro em GET /api/nfe/assinar-preview/[id]:', e);
    return NextResponse.json(
      {
        ok: false,
        mensagem: 'Erro interno ao assinar NF-e',
        detalhe: String(e?.message ?? e),
        stack: e?.stack ?? null,
      },
      { status: 500 }
    );
  }
}
