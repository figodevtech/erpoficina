// src/lib/nfe/xmlItem.ts
import type { NFeItem } from './types';

function escapeXml(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatNumber(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

export function buildDetXml(item: NFeItem): string {
  const partes: string[] = [];

  const qCom = formatNumber(item.quantidade, 2);
  const vUnCom = formatNumber(item.valorUnitario, 2);
  const vProd = formatNumber(item.valorTotal, 2);

  // Se não tiver GTIN, SEFAZ exige literalmente "SEM GTIN"
  const cEAN = item.codigoBarras && item.codigoBarras.trim() !== ''
    ? escapeXml(item.codigoBarras)
    : 'SEM GTIN';

  const cEANTrib = cEAN; // mesma lógica para o tributável

  partes.push(`<det nItem="${item.numeroItem}">`);

  // --- <prod> ---
  partes.push('<prod>');
  partes.push(`<cProd>${escapeXml(item.codigoProduto)}</cProd>`);
  partes.push(`<cEAN>${cEAN}</cEAN>`);
  partes.push(`<xProd>${escapeXml(item.descricao)}</xProd>`);
  partes.push(`<NCM>${escapeXml(item.ncm)}</NCM>`);
  partes.push(`<CFOP>${escapeXml(item.cfop)}</CFOP>`);
  partes.push(`<uCom>${escapeXml(item.unidade)}</uCom>`);
  partes.push(`<qCom>${qCom}</qCom>`);
  partes.push(`<vUnCom>${vUnCom}</vUnCom>`);
  partes.push(`<vProd>${vProd}</vProd>`);
  partes.push(`<cEANTrib>${cEANTrib}</cEANTrib>`);
  partes.push(`<uTrib>${escapeXml(item.unidade)}</uTrib>`);
  partes.push(`<qTrib>${qCom}</qTrib>`);
  partes.push(`<vUnTrib>${vUnCom}</vUnTrib>`);
  partes.push('<indTot>1</indTot>');
  partes.push('</prod>');

  // --- <imposto> ---
  partes.push('<imposto>');

  // ICMS Simples Nacional CSOSN 102
  partes.push('<ICMS>');
  partes.push('<ICMSSN102>');
  partes.push('<orig>0</orig>');
  partes.push('<CSOSN>102</CSOSN>');
  partes.push('</ICMSSN102>');
  partes.push('</ICMS>');

  // PIS NT 07
  partes.push('<PIS>');
  partes.push('<PISNT>');
  partes.push('<CST>07</CST>');
  partes.push('</PISNT>');
  partes.push('</PIS>');

  // COFINS NT 07
  partes.push('<COFINS>');
  partes.push('<COFINSNT>');
  partes.push('<CST>07</CST>');
  partes.push('</COFINSNT>');
  partes.push('</COFINS>');

  partes.push('</imposto>');

  partes.push('</det>');

  return partes.join('');
}
