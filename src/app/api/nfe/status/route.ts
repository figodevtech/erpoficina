import { NextResponse } from 'next/server';
import https from 'https';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export const runtime = 'nodejs';

const NFE_STATUS_URL =
  'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx';

function getCertificate() {
  const pfxPath = path.join(process.cwd(), 'certs', 'certificado.pfx');

  if (!fs.existsSync(pfxPath)) {
    throw new Error(`Arquivo de certificado não encontrado em: ${pfxPath}`);
  }

  const pfx = fs.readFileSync(pfxPath);
  const passphrase = process.env.NFE_CERT_PASSWORD;

  if (!passphrase) {
    throw new Error('Variável de ambiente NFE_CERT_PASSWORD não definida');
  }

  return { pfx, passphrase };
}

function buildStatusSoapEnvelope() {
  return (
    '<?xml version="1.0" encoding="utf-8"?>' +
    '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
    'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
    'xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">' +
      '<soap12:Body>' +
        '<nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4">' +
          '<consStatServ xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">' +
            '<tpAmb>2</tpAmb>' +   // Homologação
            '<cUF>25</cUF>' +      // PB
            '<xServ>STATUS</xServ>' +
          '</consStatServ>' +
        '</nfeDadosMsg>' +
      '</soap12:Body>' +
    '</soap12:Envelope>'
  );
}

export async function GET() {
  try {
    const { pfx, passphrase } = getCertificate();
    const soapEnvelope = buildStatusSoapEnvelope();

    const httpsAgent = new https.Agent({
      pfx,
      passphrase,
      rejectUnauthorized: false, // ⚠️ DEV APENAS, depois vamos tratar CA corretamente
    });

    const response = await axios.post(NFE_STATUS_URL, soapEnvelope, {
      httpsAgent,
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8',
      },
      timeout: 20000,
    });

    const xml: string = response.data;

    // Parser de XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      // se quiser, podemos ajustar mais configs depois
    });

    const parsed = parser.parse(xml);

    // A estrutura costuma vir como soap:Envelope -> soap:Body -> nfeResultMsg -> retConsStatServ
    const envelope = parsed['soap:Envelope'] ?? parsed['soap12:Envelope'] ?? parsed.Envelope;
    const body = envelope?.['soap:Body'] ?? envelope?.Body;
    const resultMsg = body?.nfeResultMsg;
    const ret = resultMsg?.retConsStatServ;

    const status = {
      ambiente: ret?.tpAmb,          // 2 = Homologação
      codigoStatus: ret?.cStat,      // 107 etc
      descricao: ret?.xMotivo,       // "Servico em Operacao"
      uf: ret?.cUF,                  // 25
      versaoAplic: ret?.verAplic,    // SVRS2024...
      dhRecebimento: ret?.dhRecbto,  // data/hora
      tempoMedio: ret?.tMed,         // tempo médio em segundos
    };

    return NextResponse.json({
      ok: true,
      message: 'Status do serviço NF-e (SVRS/PB - Homologação)',
      sefazStatus: status,
      // opcional: ainda podemos devolver um pedaço do XML pra debug
      // xmlSnippet: xml.slice(0, 400),
    });
  } catch (error: any) {
    console.error('Erro ao chamar NfeStatusServico4:', error?.response?.data || error);

    return NextResponse.json(
      {
        ok: false,
        step: 'soap-status',
        errorMessage: error?.message || String(error),
        httpStatus: error?.response?.status || null,
        httpData: error?.response?.data || null,
      },
      { status: 500 },
    );
  }
}
