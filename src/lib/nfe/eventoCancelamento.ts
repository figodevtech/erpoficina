// src/lib/nfe/buildEventoCancelamento.ts

function soNumeros(valor: string | null | undefined): string {
  if (!valor) return '';
  return valor.replace(/\D/g, '');
}

function escapeXml(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * AAAA-MM-DDThh:mm:ss-03:00 (igual à NF-e 4.00)
 */
function formatDateTimeNFe(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');

  const ano = date.getFullYear();
  const mes = pad(date.getMonth() + 1);
  const dia = pad(date.getDate());
  const hora = pad(date.getHours());
  const minuto = pad(date.getMinutes());
  const segundo = pad(date.getSeconds());

  // PB (America/Fortaleza) - fuso -03:00 (sem horário de verão)
  const tz = '-03:00';

  return `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}${tz}`;
}

export type BuildEventoCancelamentoParams = {
  cOrgao: string;   // código da UF (ex: "25" PB)
  tpAmb: 1 | 2;     // 1=PRODUÇÃO, 2=HOMOLOGAÇÃO
  cnpj: string;
  chNFe: string;    // 44 dígitos
  nProt: string;    // protocolo da autorização da NF-e
  xJust: string;    // justificativa do cancelamento
  nSeqEvento?: number; // padrão: 1
};

/**
 * Monta o XML do envEvento para cancelamento de NF-e (tpEvento=110111).
 * Retorna o XML completo + o Id do infEvento.
 */
export function buildEnvEventoCancelamento(
  params: BuildEventoCancelamentoParams
): { xml: string; id: string } {
  const chNFe = soNumeros(params.chNFe);
  const cnpj = soNumeros(params.cnpj);
  const cOrgao = params.cOrgao.padStart(2, '0') || '25';
  const tpAmbStr = String(params.tpAmb);
  const nSeq = params.nSeqEvento ?? 1;
  const nSeqStr2 = String(nSeq).padStart(2, '0');

  // Id do evento: ID + tpEvento(110111) + chave + nSeqEvento(2 dígitos)
  const id = `ID110111${chNFe}${nSeqStr2}`;

  let xJust = (params.xJust || '').trim();
  if (xJust.length > 255) {
    xJust = xJust.slice(0, 255);
  }

  const dhEvento = formatDateTimeNFe(new Date());
  const nProt = (params.nProt || '').trim();

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    `<envEvento versao="1.00" xmlns="http://www.portalfiscal.inf.br/nfe">` +
      `<idLote>000000000000001</idLote>` +
      `<evento versao="1.00">` +
        `<infEvento Id="${id}">` +
          `<cOrgao>${cOrgao}</cOrgao>` +
          `<tpAmb>${tpAmbStr}</tpAmb>` +
          `<CNPJ>${cnpj}</CNPJ>` +
          `<chNFe>${chNFe}</chNFe>` +
          `<dhEvento>${dhEvento}</dhEvento>` +
          `<tpEvento>110111</tpEvento>` +
          `<nSeqEvento>${nSeq}</nSeqEvento>` +
          `<verEvento>1.00</verEvento>` +
          `<detEvento versao="1.00">` +
            `<descEvento>Cancelamento</descEvento>` +
            `<nProt>${escapeXml(nProt)}</nProt>` +
            `<xJust>${escapeXml(xJust)}</xJust>` +
          `</detEvento>` +
        `</infEvento>` +
      `</evento>` +
    `</envEvento>`;

  return { xml, id };
}
