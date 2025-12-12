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

/**
 * Formata número no padrão da NF-e (ponto como separador decimal).
 */
function formatNumber(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

/**
 * Helper pra garantir número, com fallback.
 */
function num(value: number | null | undefined, fallback: number): number {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return fallback;
  }
  return Number(value);
}

/**
 * Gera o bloco <det> (item da NF-e) incluindo:
 * - <prod>
 * - <imposto> (ICMS + PIS + COFINS)
 *
 * Regime:
 * - Simples Nacional: usa CSOSN (ICMSSN102) e PIS/COFINS NT 07 por padrão
 * - Lucro Presumido / Regime Normal:
 *   - ICMS00 (CST, vBC, pICMS, vICMS)
 *   - PIS / COFINS com base em PISAliq / COFINSAliq quando CST = 01/02
 */
export function buildDetXml(item: NFeItem): string {
  const partes: string[] = [];

  // Quantidade / valor
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

  // ===================================================
  // ICMS
  // ===================================================
  const regime = item.regimeTributario;

  const temCsosn =
    item.csosn !== undefined &&
    item.csosn !== null &&
    String(item.csosn).trim() !== '';

  const temCstIcms =
    item.cstIcms !== undefined &&
    item.cstIcms !== null &&
    String(item.cstIcms).trim() !== '';

  if (regime === 'SIMPLES_NACIONAL' && temCsosn) {
    // -------------------------------
    // Simples Nacional - ICMSSN102
    // -------------------------------
    partes.push('<ICMS>');
    partes.push('<ICMSSN102>');
    partes.push(`<orig>${escapeXml(item.origemMercadoria || '0')}</orig>`);
    partes.push(`<CSOSN>${escapeXml(String(item.csosn))}</CSOSN>`);
    partes.push('</ICMSSN102>');
    partes.push('</ICMS>');
  } else if (temCstIcms) {
    // ---------------------------------------------
    // Regime Normal (Lucro Presumido / Lucro Real)
    // ICMS00 (ou, se quiser, outros CST futuramente)
    // ---------------------------------------------
    const cstLimpo = String(item.cstIcms).padStart(2, '0');

    // Base de cálculo e alíquota
    const vBC = num(item.baseCalculoIcms, item.valorTotal);
    const pICMS = num(item.aliquotaIcms, 0);
    const vICMS = num(item.valorIcms, (vBC * pICMS) / 100);

    const vBCStr = formatNumber(vBC, 2);
    const pICMSStr = formatNumber(pICMS, 2);
    const vICMSStr = formatNumber(vICMS, 2);

    // OBS: aqui estou tratando tudo como ICMS00.
    // Se você passar CST diferente de "00", o XML ainda
    // fica tecnicamente válido, mas o ideal é, no futuro,
    // criar ramificações: ICMS20, ICMS40, etc, se precisar.
    partes.push('<ICMS>');
    partes.push('<ICMS00>');
    partes.push(`<orig>${escapeXml(item.origemMercadoria || '0')}</orig>`);
    partes.push(`<CST>${escapeXml(cstLimpo)}</CST>`);
    partes.push(
      `<modBC>${escapeXml(item.modalidadeBCIcms || '3')}</modBC>`
    );
    partes.push(`<vBC>${vBCStr}</vBC>`);
    partes.push(`<pICMS>${pICMSStr}</pICMS>`);
    partes.push(`<vICMS>${vICMSStr}</vICMS>`);
    partes.push('</ICMS00>');
    partes.push('</ICMS>');
  } else {
    // Fallback bem conservador (similar ao que você já usava)
    // ICMS Simples com CSOSN 102 padrão se nada foi preenchido.
    partes.push('<ICMS>');
    partes.push('<ICMSSN102>');
    partes.push('<orig>0</orig>');
    partes.push('<CSOSN>102</CSOSN>');
    partes.push('</ICMSSN102>');
    partes.push('</ICMS>');
  }

  // ===================================================
  // PIS
  // ===================================================
  const cstPis =
    (item.cstPis && String(item.cstPis).padStart(2, '0')) || '07';

  // Quando CST 01/02 => PISAliq
  const usaPISAliq = cstPis === '01' || cstPis === '02';

  if (usaPISAliq) {
    // Lucro Presumido normalmente usa PISAliq (ex: 0,65%)
    const vBCPis = num(item.baseCalculoPis, item.valorTotal);
    const pPis =
      item.aliquotaPis ??
      // fallbackzinho: se regime for Lucro Presumido,
      // assume 0,65%; senão, 0
      (regime === 'LUCRO_PRESUMIDO' ? 0.65 : 0);
    const vPis = num(item.valorPis, (vBCPis * pPis) / 100);

    const vBCPisStr = formatNumber(vBCPis, 2);
    const pPisStr = formatNumber(pPis, 2);
    const vPisStr = formatNumber(vPis, 2);

    partes.push('<PIS>');
    partes.push('<PISAliq>');
    partes.push(`<CST>${cstPis}</CST>`);
    partes.push(`<vBC>${vBCPisStr}</vBC>`);
    partes.push(`<pPIS>${pPisStr}</pPIS>`);
    partes.push(`<vPIS>${vPisStr}</vPIS>`);
    partes.push('</PISAliq>');
    partes.push('</PIS>');
  } else {
    // PISNT (isento/suspenso etc.) – mantém compat com o que você já usava
    partes.push('<PIS>');
    partes.push('<PISNT>');
    partes.push(`<CST>${cstPis}</CST>`);
    partes.push('</PISNT>');
    partes.push('</PIS>');
  }

  // ===================================================
  // COFINS
  // ===================================================
  const cstCofins =
    (item.cstCofins && String(item.cstCofins).padStart(2, '0')) || '07';

  const usaCOFINSAliq = cstCofins === '01' || cstCofins === '02';

  if (usaCOFINSAliq) {
    // Lucro Presumido normalmente usa COFINSAliq (ex: 3%)
    const vBCCofins = num(item.baseCalculoCofins, item.valorTotal);
    const pCofins =
      item.aliquotaCofins ??
      (regime === 'LUCRO_PRESUMIDO' ? 3.0 : 0);
    const vCofins = num(
      item.valorCofins,
      (vBCCofins * pCofins) / 100
    );

    const vBCCofinsStr = formatNumber(vBCCofins, 2);
    const pCofinsStr = formatNumber(pCofins, 2);
    const vCofinsStr = formatNumber(vCofins, 2);

    partes.push('<COFINS>');
    partes.push('<COFINSAliq>');
    partes.push(`<CST>${cstCofins}</CST>`);
    partes.push(`<vBC>${vBCCofinsStr}</vBC>`);
    partes.push(`<pCOFINS>${pCofinsStr}</pCOFINS>`);
    partes.push(`<vCOFINS>${vCofinsStr}</vCOFINS>`);
    partes.push('</COFINSAliq>');
    partes.push('</COFINS>');
  } else {
    // COFINSNT (isento/suspenso etc.)
    partes.push('<COFINS>');
    partes.push('<COFINSNT>');
    partes.push(`<CST>${cstCofins}</CST>`);
    partes.push('</COFINSNT>');
    partes.push('</COFINS>');
  }

  partes.push('</imposto>');

  partes.push('</det>');

  return partes.join('');
}
