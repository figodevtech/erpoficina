// src/lib/nfe/nfeProc.ts

/**
 * Monta o XML nfeProc (NF-e + protocolo) a partir:
 *  - do XML da NFe já ASSINADA (xmlNFeAssinada)
 *  - do XML de retorno da SEFAZ (xmlRetEnviNFe), que contém <protNFe>
 */
export function buildNFeProcXml(
  xmlNFeAssinada: string,
  xmlRetEnviNFe: string
): string {
  // 1) Extrai o bloco <protNFe>...</protNFe> do retorno da SEFAZ
  const protMatch = xmlRetEnviNFe.match(/<protNFe[^>]*>[\s\S]*?<\/protNFe>/);
  if (!protMatch) {
    throw new Error('Não foi encontrado <protNFe> no retorno da SEFAZ.');
  }
  const protNFeXml = protMatch[0];

  // 2) Remove a declaração XML da NFe, se existir
  const nfeSemDecl = xmlNFeAssinada.replace(/<\?xml[^>]*\?>\s*/i, '');

  // 3) Monta o nfeProc conforme manual da NF-e
  const nfeProc =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">' +
    nfeSemDecl +
    protNFeXml +
    '</nfeProc>';

  return nfeProc;
}
