// src/app/api/nfe/consultar/[id]/route.ts
import { NextResponse } from 'next/server';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { EmpresaRow } from '@/lib/nfe/types';

export const runtime = 'nodejs';

type NfeRow = {
  id: number;
  modelo: string;
  serie: number;
  numero: number;
  chave_acesso: string;
  ambiente: 'HOMOLOGACAO' | 'PRODUCAO';
  status: string;
  ordemservicoid: number | null;
  vendaid: number | null;
  clienteid: number;
  dataemissao: string;
  dataautorizacao: string | null;
  protocolo: string | null;
  total_produtos: string | number;
  total_servicos: string | number;
  total_nfe: string | number;
  xml_assinado: string | null;
  xml_autorizado: string | null;
  empresaid: number;
};

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
          // IMPORTANTE: action do NFeConsultaProtocolo4
          'Content-Type':
            'application/soap+xml; charset=utf-8; action="http://www.portalfiscal.inf.br/nfe/wsdl/NFeConsultaProtocolo4/nfeConsultaNF"',
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

async function consultarHandler(_req: Request, nfeIdParam: string) {
  try {
    const nfeId = Number(nfeIdParam);

    if (Number.isNaN(nfeId)) {
      return NextResponse.json(
        { ok: false, message: 'ID de NF-e inválido' },
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
      console.error('[nfe/consultar] erro ao buscar NF-e:', nfeError);
      return NextResponse.json(
        {
          ok: false,
          message: 'Erro ao buscar NF-e no banco',
          detalhe: nfeError.message,
        },
        { status: 500 },
      );
    }

    if (!nfe) {
      return NextResponse.json(
        { ok: false, message: 'NF-e não encontrada' },
        { status: 404 },
      );
    }

    if (!nfe.empresaid) {
      return NextResponse.json(
        {
          ok: false,
          message: 'NF-e não possui empresa associada (empresaid nulo)',
        },
        { status: 500 },
      );
    }

    // 2) Buscar empresa para pegar caminho do certificado / senha
    const { data: empresa, error: empresaError } = await supabaseAdmin
      .from('empresa')
      .select('*')
      .eq('id', nfe.empresaid)
      .single<EmpresaRow>();

    if (empresaError) {
      console.error('[nfe/consultar] erro ao buscar empresa:', empresaError);
      return NextResponse.json(
        {
          ok: false,
          message: 'Erro ao buscar empresa no banco',
          detalhe: empresaError.message,
        },
        { status: 500 },
      );
    }

    if (!empresa) {
      return NextResponse.json(
        { ok: false, message: 'Empresa não encontrada' },
        { status: 404 },
      );
    }

    // 3) Ambiente & chave
    const ambiente =
      (nfe.ambiente as 'HOMOLOGACAO' | 'PRODUCAO') ??
      (empresa.ambiente === 'PRODUCAO' ? 'PRODUCAO' : 'HOMOLOGACAO');

    const tpAmb = ambiente === 'PRODUCAO' ? '1' : '2';
    const chNFe = nfe.chave_acesso;

    if (!chNFe || chNFe.length !== 44) {
      return NextResponse.json(
        {
          ok: false,
          ambiente,
          nfeId,
          message: 'Chave de acesso inválida ou ausente na NF-e',
        },
        { status: 500 },
      );
    }

    // 4) XML de consulta (SEM declaração XML dentro do nfeDadosMsg!)
    const consSitNFeXml =
      '<consSitNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">' +
      `<tpAmb>${tpAmb}</tpAmb>` +
      '<xServ>CONSULTAR</xServ>' +
      `<chNFe>${chNFe}</chNFe>` +
      '</consSitNFe>';

    // 5) SOAP Envelope para NFeConsultaProtocolo4
    const soapEnvelope =
      '<?xml version="1.0" encoding="utf-8"?>' +
      '<soap12:Envelope ' +
      'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
      'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
      'xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">' +
      '<soap12:Body>' +
      '<nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeConsultaProtocolo4">' +
      consSitNFeXml +
      '</nfeDadosMsg>' +
      '</soap12:Body>' +
      '</soap12:Envelope>';

    // 6) URL do webservice SVRS NFeConsultaProtocolo4 (NFe, não NFC-e)
    const url =
      ambiente === 'PRODUCAO'
        ? 'https://nfe.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx'
        : 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx';

    // 7) Montar agente HTTPS com PFX
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
      rejectUnauthorized: false, // em produção, ideal é true com cadeia correta
    });

    // 8) Enviar SOAP
    const { httpStatus, body: respostaText } = await postSoapComCert(
      url,
      soapEnvelope,
      httpsAgent,
    );

    if (httpStatus !== 200) {
      return NextResponse.json(
        {
          ok: false,
          ambiente,
          nfeId,
          httpStatus,
          message: 'Erro HTTP ao chamar NFeConsultaProtocolo4',
          soap: {
            xmlEnviado: soapEnvelope,
            xmlRespostaSnippet: respostaText.substring(0, 2000),
          },
        },
        { status: 500 },
      );
    }

    // 9) Parse do XML de retorno (retConsSitNFe)
    const parser = new XMLParser({ ignoreAttributes: false });

    let cStat: string | null = null;
    let xMotivo: string | null = null;
    let prot_cStat: string | null = null;
    let prot_xMotivo: string | null = null;
    let nProt: string | null = null;
    let dhRecbto: string | null = null;

    try {
      const parsed = parser.parse(respostaText);
      const envelope = parsed['soap:Envelope'] ?? parsed.Envelope;
      const body = envelope?.['soap:Body'] ?? envelope?.Body;
      const resultMsg = body?.nfeResultMsg ?? body?.['nfeResultMsg'];
      const retConsSitNFe = resultMsg?.retConsSitNFe;

      const rawCStat = retConsSitNFe?.cStat;
      cStat = rawCStat != null ? String(rawCStat) : null;
      xMotivo = retConsSitNFe?.xMotivo ?? null;

      const protNFe = retConsSitNFe?.protNFe;
      const infProt = protNFe?.infProt;

      const rawProtCStat = infProt?.cStat;
      prot_cStat = rawProtCStat != null ? String(rawProtCStat) : null;
      prot_xMotivo = infProt?.xMotivo ?? null;
      nProt =
        infProt?.nProt != null ? String(infProt.nProt) : nfe.protocolo ?? null;
      dhRecbto = infProt?.dhRecbto ?? null;
    } catch (parseErr) {
      console.warn(
        '[nfe/consultar] erro ao parsear XML de retorno da SEFAZ:',
        parseErr,
      );
    }

    // 10) Atualizar status/protocolo no banco (se fizer sentido)
    let statusFinal: string | null = nfe.status;
    let protocoloFinal: string | null = nfe.protocolo ?? null;

    if (prot_cStat === '100') {
      statusFinal = 'AUTORIZADA';
      protocoloFinal = nProt ?? protocoloFinal;
    } else if (['110', '301', '302'].includes(prot_cStat || '')) {
      statusFinal = 'DENEGADA';
      protocoloFinal = nProt ?? protocoloFinal;
    } else if (prot_cStat && prot_cStat !== '100') {
      statusFinal = 'REJEITADA';
    }

    try {
      const updatePayload: any = {
        updatedat: new Date().toISOString(),
      };

      if (statusFinal && statusFinal !== nfe.status) {
        updatePayload.status = statusFinal;
      }

      if (protocoloFinal && protocoloFinal !== nfe.protocolo) {
        updatePayload.protocolo = protocoloFinal;
      }

      if (statusFinal === 'AUTORIZADA' && dhRecbto && !nfe.dataautorizacao) {
        updatePayload.dataautorizacao = dhRecbto;
      }

      if (Object.keys(updatePayload).length > 1) {
        await supabaseAdmin.from('nfe').update(updatePayload).eq('id', nfeId);
      }
    } catch (updateErr) {
      console.warn('[nfe/consultar] falha ao atualizar NF-e:', updateErr);
    }

    // 11) Resposta para o front
    return NextResponse.json({
      ok: true,
      ambiente,
      nfeId,
      sefaz: {
        cStat,
        xMotivo,
        protocolo: {
          cStat: prot_cStat,
          xMotivo: prot_xMotivo,
          nProt: protocoloFinal ?? nProt,
          dhRecbto,
        },
      },
      nfeDb: {
        id: nfeId,
        status: statusFinal,
        protocolo: protocoloFinal,
      },
      soap: {
        xmlEnviado: soapEnvelope,
        xmlRespostaSnippet: respostaText.substring(0, 2000),
      },
    });
  } catch (e: any) {
    console.error('Erro em /api/nfe/consultar/[id]:', e);
    return NextResponse.json(
      {
        ok: false,
        message: 'Erro interno ao consultar NF-e',
        detalhe: String(e?.message ?? e),
        stack: e?.stack ?? null,
      },
      { status: 500 },
    );
  }
}

// Next 15: params é Promise, igual na sua rota de autorização
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  return consultarHandler(req, id);
}
