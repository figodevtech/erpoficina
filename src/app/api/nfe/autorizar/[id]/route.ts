// src/app/api/nfe/autorizar/[id]/route.ts

import { NextResponse } from 'next/server';
import https from 'https';
import fs from 'fs';
import path from 'path';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { buildNFePreviewXml } from '@/lib/nfe/buildNFe';
import { carregarCertificadoA1 } from '@/lib/nfe/certificado';
import { assinarNFeXml } from '@/lib/nfe/assinatura';
import { buildEnviNFeXml } from '@/lib/nfe/enviNFe';
import type { EmpresaRow } from '@/lib/nfe/types';

export const runtime = 'nodejs';

/**
 * Helper para extrair conteúdo simples de tags XML (primeira ocorrência).
 */
function getTagValue(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>([^<]+)</${tag}>`);
  const match = xml.match(regex);
  return match ? match[1] : null;
}

/**
 * Envia SOAP via https.request usando client-cert (PFX).
 */
function postSoapComCert(
  url: string,
  soapEnvelope: string,
  agent: https.Agent,
): Promise<{ httpStatus: number; body: string }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const req = https.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname,
        method: 'POST',
        agent,
        headers: {
          'Content-Type':
            'application/soap+xml; charset=utf-8; action="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote"',
          'Content-Length': Buffer.byteLength(soapEnvelope).toString(),
        },
      },
      (res) => {
        let data = '';

        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            httpStatus: res.statusCode ?? 0,
            body: data,
          });
        });
      },
    );

    req.on('error', (err) => {
      reject(err);
    });

    req.write(soapEnvelope);
    req.end();
  });
}

async function autorizarHandler(req: Request, nfeIdParam: string) {
  try {
    // -------------------------------------------------------------------
    // 1) Validar ID da NF-e (tabela nfe)
    // -------------------------------------------------------------------
    const nfeId = Number(nfeIdParam);
    if (Number.isNaN(nfeId)) {
      return NextResponse.json(
        { ok: false, mensagem: 'ID de NF-e inválido' },
        { status: 400 },
      );
    }

    // -------------------------------------------------------------------
    // 2) Buscar registro da NF-e no Supabase
    // -------------------------------------------------------------------
    const { data: nfe, error: nfeError } = await supabaseAdmin
      .from('nfe')
      .select('*')
      .eq('id', nfeId)
      .maybeSingle();

    if (nfeError) {
      console.error('[nfe] erro ao buscar NF-e:', nfeError);
      return NextResponse.json(
        {
          ok: false,
          mensagem: 'Erro ao buscar NF-e no banco',
          detalhe: nfeError.message,
        },
        { status: 500 },
      );
    }

    if (!nfe) {
      return NextResponse.json(
        { ok: false, mensagem: 'NF-e não encontrada' },
        { status: 404 },
      );
    }

    // Esperado: nfe.empresaid, nfe.numero, nfe.serie
    if (!nfe.empresaid) {
      return NextResponse.json(
        {
          ok: false,
          mensagem: 'NF-e não possui empresa associada (empresaid nulo)',
        },
        { status: 500 },
      );
    }

    if (nfe.numero == null || nfe.serie == null) {
      return NextResponse.json(
        {
          ok: false,
          mensagem:
            'NF-e não possui número ou série definidos (campos numero/serie)',
        },
        { status: 500 },
      );
    }

    const numeroNota = Number(nfe.numero);
    const serie = Number(nfe.serie);

    // -------------------------------------------------------------------
    // 3) Buscar empresa no Supabase (usando nfe.empresaid)
    // -------------------------------------------------------------------
    const { data: empresa, error: empresaError } = await supabaseAdmin
      .from('empresa')
      .select('*')
      .eq('id', nfe.empresaid)
      .single<EmpresaRow>();

    if (empresaError) {
      console.error('[empresa] erro ao buscar empresa:', empresaError);
      return NextResponse.json(
        {
          ok: false,
          mensagem: 'Erro ao buscar empresa no banco',
          detalhe: empresaError.message,
        },
        { status: 500 },
      );
    }

    if (!empresa) {
      return NextResponse.json(
        { ok: false, mensagem: 'Empresa não encontrada' },
        { status: 404 },
      );
    }

    const ambiente =
      empresa.ambiente === 'PRODUCAO' ? 'PRODUCAO' : 'HOMOLOGACAO';

    // -------------------------------------------------------------------
    // 4) Montar XML da NFe (sem assinatura), a partir da empresa + numero/série
    //    (buildNFePreviewXml pode internamente usar OS, venda, cliente, etc.)
    // -------------------------------------------------------------------
    const { xml: xmlOriginal, chave, id } = buildNFePreviewXml(
      empresa,
      numeroNota,
      serie,
    );

    // -------------------------------------------------------------------
    // 5) Carregar certificado A1 (chave privada + certificado em PEM)
    // -------------------------------------------------------------------
    const { privateKeyPem, certificatePem } = await carregarCertificadoA1(
      empresa,
    );

    // -------------------------------------------------------------------
    // 6) Assinar XML da NFe (tag <infNFe>)
    // -------------------------------------------------------------------
    const xmlAssinado = assinarNFeXml(
      xmlOriginal,
      privateKeyPem,
      certificatePem,
    );

    // -------------------------------------------------------------------
    // 7) Montar o XML do <enviNFe> (lote) com o XML assinado
    // -------------------------------------------------------------------
    const enviNFeXml = buildEnviNFeXml(xmlAssinado);

    // -------------------------------------------------------------------
    // 8) Montar SOAP Envelope para o serviço NFeAutorizacao4
    // -------------------------------------------------------------------
    const soapEnvelope =
      '<?xml version="1.0" encoding="utf-8"?>' +
      '<soap12:Envelope ' +
      'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
      'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
      'xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">' +
      '<soap12:Body>' +
      '<nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4">' +
      enviNFeXml +
      '</nfeDadosMsg>' +
      '</soap12:Body>' +
      '</soap12:Envelope>';

    // -------------------------------------------------------------------
    // 9) URL do webservice (SVRS - PB) para PRODUÇÃO / HOMOLOGAÇÃO
    // -------------------------------------------------------------------
    const url =
      ambiente === 'PRODUCAO'
        ? 'https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx'
        : 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx';

    // -------------------------------------------------------------------
    // 10) Montar agente HTTPS com o PFX para autenticação mútua TLS
    // -------------------------------------------------------------------
    const pfxPathRaw =
      empresa.certificadocaminho ||
      process.env.NFE_CERT_PFX_PATH ||
      'C:\\certs\\certificado.pfx';

    const pfxPath = path.resolve(pfxPathRaw);
    const pfxPass =
      empresa.certificadosenha ?? process.env.NFE_CERT_PFX_PASSWORD ?? '';

    const httpsAgent = new https.Agent({
      pfx: fs.readFileSync(pfxPath),
      passphrase: pfxPass,
      // Em produção, o ideal é deixar como true e ter a cadeia de certificados correta:
      rejectUnauthorized: false,
    });

    // -------------------------------------------------------------------
    // 11) Enviar requisição SOAP para o webservice usando https.request
    // -------------------------------------------------------------------
    const { httpStatus, body: respostaText } = await postSoapComCert(
      url,
      soapEnvelope,
      httpsAgent,
    );

    // -------------------------------------------------------------------
    // 12) Se HTTP não for 200, já retorna erro bruto
    // -------------------------------------------------------------------
    if (httpStatus !== 200) {
      return NextResponse.json(
        {
          ok: false,
          ambiente,
          chave,
          idNFe: id, // Id lógico da NFe (ex: NFe3525...)
          httpStatus,
          mensagem: 'Erro HTTP ao chamar NFeAutorizacao4',
          soap: {
            xmlEnviado: soapEnvelope,
            xmlRespostaSnippet: respostaText.substring(0, 2000),
          },
        },
        { status: 500 },
      );
    }

    // -------------------------------------------------------------------
    // 13) Extrair cStat, xMotivo e nRec do XML de retorno
    // -------------------------------------------------------------------
    const cStat = getTagValue(respostaText, 'cStat');
    const xMotivo = getTagValue(respostaText, 'xMotivo');
    const nRec = getTagValue(respostaText, 'nRec');

    // -------------------------------------------------------------------
    // 14) (Opcional) Atualizar tabela nfe com status / xml, se você já criou
    //     colunas como: status, xml_assinado, xml_autorizado, sefaz_cstat, etc.
    // -------------------------------------------------------------------
    try {
      await supabaseAdmin
        .from('nfe')
        .update({
          // status: cStat === '100' ? 'AUTORIZADA' : 'ENVIADA',
          // sefaz_cstat: cStat,
          // sefaz_xmotivo: xMotivo,
          // sefaz_nrec: nRec,
          // xml_assinado: xmlAssinado,
          // xml_ultima_resposta: respostaText,
        })
        .eq('id', nfeId);
    } catch (updateErr) {
      console.warn(
        '[nfe] falha ao atualizar status da NF-e (pode ser apenas falta de colunas):',
        updateErr,
      );
    }

    // -------------------------------------------------------------------
    // 15) Responder JSON para o frontend
    // -------------------------------------------------------------------
    return NextResponse.json({
      ok: true,
      ambiente,
      chave,
      idNFe: id, // Id lógico da NFe no XML, não o id da tabela
      httpStatus,
      sefaz: {
        cStat,
        xMotivo,
        nRec,
      },
      soap: {
        xmlEnviado: soapEnvelope,
        xmlRespostaSnippet: respostaText.substring(0, 2000),
      },
    });
  } catch (e: any) {
    console.error('Erro em /api/nfe/autorizar/[id]:', e);
    return NextResponse.json(
      {
        ok: false,
        mensagem: 'Erro interno ao enviar NF-e para autorização',
        detalhe: String(e?.message ?? e),
        stack: e?.stack ?? null,
      },
      { status: 500 },
    );
  }
}

// ATENÇÃO: no Next 15, params é uma Promise.
// Aqui a gente resolve isso no POST e passa só o id (string) para o handler.
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  return autorizarHandler(req, id);
}
