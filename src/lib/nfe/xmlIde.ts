// src/lib/nfe/xmlIde.ts

import type { NFeIde } from './types';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Monta o XML do bloco <ide> na ORDEM exigida pelo schema da NF-e 4.00.
 */
export function buildIdeXml(ide: NFeIde): string {
  const p: string[] = [];

  p.push('<ide>');
  p.push(`<cUF>${ide.cUF}</cUF>`);
  p.push(`<cNF>${ide.cNF}</cNF>`);
  p.push(`<natOp>${escapeXml(ide.natOp)}</natOp>`);
  p.push(`<mod>${ide.mod}</mod>`);
  p.push(`<serie>${ide.serie}</serie>`);
  p.push(`<nNF>${ide.nNF}</nNF>`);
  p.push(`<dhEmi>${ide.dhEmi}</dhEmi>`);
  p.push(`<tpNF>${ide.tpNF}</tpNF>`);
  p.push(`<idDest>${ide.idDest}</idDest>`);
  p.push(`<cMunFG>${ide.cMunFG}</cMunFG>`);
  p.push(`<tpImp>${ide.tpImp}</tpImp>`);
  p.push(`<tpEmis>${ide.tpEmis}</tpEmis>`);
  p.push(`<cDV>${ide.cDV}</cDV>`); // DV ANTES do tpAmb
  p.push(`<tpAmb>${ide.tpAmb}</tpAmb>`);
  p.push(`<finNFe>${ide.finNFe}</finNFe>`);
  p.push(`<indFinal>${ide.indFinal}</indFinal>`);
  p.push(`<indPres>${ide.indPres}</indPres>`);
  p.push(`<procEmi>${ide.procEmi}</procEmi>`);
  p.push(`<verProc>${escapeXml(ide.verProc)}</verProc>`);
  p.push('</ide>');

  return p.join('');
}
