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

/**
 * crt:
 *  "1" ou "2" -> Simples Nacional (usa CSOSN)
 *  "3"        -> Regime Normal (Lucro Presumido / Real) – usa CST
 */
export function buildDetXml(item: NFeItem, crt: string): string {
  const partes: string[] = [];

  const qCom = formatNumber(item.quantidade, 2);
  const vUnCom = formatNumber(item.valorUnitario, 2);
  const vProd = formatNumber(item.valorTotal, 2);

  // Se não tiver GTIN, SEFAZ exige literalmente "SEM GTIN"
  const cEAN =
    item.codigoBarras && item.codigoBarras.trim() !== ''
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

  // =========================
  // ICMS
  // =========================
  partes.push('<ICMS>');

  const crtStr = (crt || '').toString();
  const isSimplesNacional = crtStr === '1' || crtStr === '2';

  const cst = (item.cst || '').trim();
  const csosn = (item.csosn || '').trim();
  const aliqIcms = Number(item.aliquotaIcms ?? 0);
  const vBCIcmsNumber = Number(item.valorTotal ?? 0);
  const vIcmsNumber = (vBCIcmsNumber * aliqIcms) / 100;

  if (isSimplesNacional) {
    // ---------- Simples Nacional (CRT 1 ou 2) ----------
    const csosnTag = csosn || '102';

    partes.push('<ICMSSN102>');
    partes.push('<orig>0</orig>');
    partes.push(`<CSOSN>${escapeXml(csosnTag)}</CSOSN>`);
    partes.push('</ICMSSN102>');
  } else {
    // ---------- Regime Normal (CRT 3 - Lucro Presumido/Real) ----------
    const cstTag = cst || '00';

    switch (cstTag) {
      case '00':
      default: {
        const vBC = formatNumber(vBCIcmsNumber, 2);
        const pICMS = formatNumber(aliqIcms, 2);
        const vICMS = formatNumber(vIcmsNumber, 2);

        partes.push('<ICMS00>');
        partes.push('<orig>0</orig>');
        partes.push(`<CST>${escapeXml(cstTag)}</CST>`);
        // 3 = valor da operação
        partes.push('<modBC>3</modBC>');
        partes.push(`<vBC>${vBC}</vBC>`);
        partes.push(`<pICMS>${pICMS}</pICMS>`);
        partes.push(`<vICMS>${vICMS}</vICMS>`);
        partes.push('</ICMS00>');
        break;
      }
    }
  }

  partes.push('</ICMS>');

  // =========================
  // PIS
  // =========================
  const cstPis = (item.cstPis || '').trim() || '07';
  const aliqPis = Number(item.aliquotaPis ?? 0);
  const vBCPisNumber = Number(item.valorTotal ?? 0);
  const vPisNumber = (vBCPisNumber * aliqPis) / 100;

  partes.push('<PIS>');
  if (['01', '02', '05'].includes(cstPis) && aliqPis > 0) {
    // PISAliq
    const vBC = formatNumber(vBCPisNumber, 2);
    const pPIS = formatNumber(aliqPis, 2);
    const vPIS = formatNumber(vPisNumber, 2);

    partes.push('<PISAliq>');
    partes.push(`<CST>${escapeXml(cstPis)}</CST>`);
    partes.push(`<vBC>${vBC}</vBC>`);
    partes.push(`<pPIS>${pPIS}</pPIS>`);
    partes.push(`<vPIS>${vPIS}</vPIS>`);
    partes.push('</PISAliq>');
  } else {
    // PISNT (não tributado)
    const cstPisNt = ['04', '06', '07', '08', '09'].includes(cstPis)
      ? cstPis
      : '07';

    partes.push('<PISNT>');
    partes.push(`<CST>${escapeXml(cstPisNt)}</CST>`);
    partes.push('</PISNT>');
  }
  partes.push('</PIS>');

  // =========================
  // COFINS
  // =========================
  const cstCofins = (item.cstCofins || '').trim() || '07';
  const aliqCofins = Number(item.aliquotaCofins ?? 0);
  const vBCCofinsNumber = Number(item.valorTotal ?? 0);
  const vCofinsNumber = (vBCCofinsNumber * aliqCofins) / 100;

  partes.push('<COFINS>');
  if (['01', '02', '05'].includes(cstCofins) && aliqCofins > 0) {
    // COFINSAliq
    const vBC = formatNumber(vBCCofinsNumber, 2);
    const pCOFINS = formatNumber(aliqCofins, 2);
    const vCOFINS = formatNumber(vCofinsNumber, 2);

    partes.push('<COFINSAliq>');
    partes.push(`<CST>${escapeXml(cstCofins)}</CST>`);
    partes.push(`<vBC>${vBC}</vBC>`);
    partes.push(`<pCOFINS>${pCOFINS}</pCOFINS>`);
    partes.push(`<vCOFINS>${vCOFINS}</vCOFINS>`);
    partes.push('</COFINSAliq>');
  } else {
    // COFINSNT
    const cstCofinsNt = ['04', '06', '07', '08', '09'].includes(cstCofins)
      ? cstCofins
      : '07';

    partes.push('<COFINSNT>');
    partes.push(`<CST>${escapeXml(cstCofinsNt)}</CST>`);
    partes.push('</COFINSNT>');
  }
  partes.push('</COFINS>');

  partes.push('</imposto>');
  partes.push('</det>');

  return partes.join('');
}
