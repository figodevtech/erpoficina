// src/lib/nfe/enviNFe.ts

/**
 * Monta o XML do enviNFe (lote) com uma única NFe já ASSINADA.
 */
export function buildEnviNFeXml(xmlNFeAssinada: string): string {
  // Remove declaração XML se existir (<?xml ... ?> no início)
  const xmlSemDeclaracao = xmlNFeAssinada.replace(
    /^\s*<\?xml[^>]*\?>\s*/i,
    ''
  );

  return (
    '<enviNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">' +
      '<idLote>000000000000001</idLote>' +
      '<indSinc>1</indSinc>' +
      xmlSemDeclaracao +
    '</enviNFe>'
  );
}
