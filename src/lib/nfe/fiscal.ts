import type { CRT, CSOSN, CSTICMS, CSTPisCofins, NFeItem, OrigemMercadoria } from './types';
import { escapeXml } from './xmlUtils';

export type TotaisNFe = {
  vProd: number;
  vBC: number;
  vICMS: number;
  vPIS: number;
  vCOFINS: number;
};

const CSOSN_SUPORTADOS = new Set<CSOSN>(['101', '102', '103', '201', '202', '203', '300', '400', '500', '900']);
const CST_ICMS_SUPORTADOS = new Set<CSTICMS>(['00', '10', '20', '30', '40', '41', '50', '51', '60', '70', '90']);
const CST_PIS_COFINS_TRIBUTADOS = new Set(['01', '02']);
const CST_PIS_COFINS_NT = new Set(['04', '06', '07', '08', '09']);

function fmt(value: number | null | undefined, decimals = 2): string {
  return Number(value ?? 0).toFixed(decimals);
}

function clean(value: string | number | null | undefined): string {
  return String(value ?? '').trim();
}

function onlyDigits(value: string | number | null | undefined): string {
  return clean(value).replace(/\D/g, '');
}

function normalizarCSTICMS(value: string | number | null | undefined): string {
  const raw = clean(value);
  if (!raw) return '';

  const digits = raw.replace(/\D/g, '');
  if (digits && digits.length > 2) {
    return digits.slice(-2);
  }

  return digits || raw;
}

function tag(name: string, value: string | number): string {
  return `<${name}>${escapeXml(value)}</${name}>`;
}

export function normalizarCRT(value: string | number | null | undefined): CRT {
  const crt = clean(value);

  if (crt === '1' || crt === '2' || crt === '3' || crt === '4') {
    return Number(crt) as CRT;
  }

  throw new Error(`CRT do emitente invalido ou nao informado: "${value ?? ''}". Use 1, 2, 3 ou 4.`);
}

function getOrigem(item: NFeItem): OrigemMercadoria {
  const origem = clean(item.orig) || '0';
  if (!/^[0-8]$/.test(origem)) {
    throw new Error(`Origem da mercadoria invalida no item ${item.numeroItem}: "${origem}".`);
  }
  return origem as OrigemMercadoria;
}

function getCSOSN(item: NFeItem, crt: CRT): CSOSN {
  const csosn = clean(item.csosn);
  if (!csosn) {
    if (crt === 4) return '102';
    throw new Error(`Item ${item.numeroItem}: CRT ${crt} exige CSOSN informado. Nao use CST ICMS para Simples Nacional/MEI.`);
  }
  if (!CSOSN_SUPORTADOS.has(csosn as CSOSN)) {
    throw new Error(`Item ${item.numeroItem}: CSOSN "${csosn}" nao suportado.`);
  }
  return csosn as CSOSN;
}

function getCSTICMS(item: NFeItem): CSTICMS {
  const cst = normalizarCSTICMS(item.cstIcms || item.cst);
  if (!cst) {
    throw new Error(`Item ${item.numeroItem}: CRT 3 exige CST ICMS informado. Nao use CSOSN para Regime Normal.`);
  }
  if (!CST_ICMS_SUPORTADOS.has(cst as CSTICMS)) {
    throw new Error(`Item ${item.numeroItem}: CST ICMS "${cst}" nao suportado.`);
  }
  return cst as CSTICMS;
}

function getCstPisCofins(value: string | number | null | undefined, fallback: CSTPisCofins): CSTPisCofins {
  const raw = clean(value);
  const digits = raw.replace(/\D/g, '');
  const normalized = digits.length > 2 ? digits.slice(-2) : digits.padStart(2, '0');
  const cst = raw && normalized !== '00' ? normalized : fallback;
  return cst as CSTPisCofins;
}

function getCstPisCofinsPorCRT(
  value: string | number | null | undefined,
  crt: CRT
): CSTPisCofins {
  const cst = getCstPisCofins(value, crt === 4 ? '08' : '07');

  if (crt === 4 && cst !== '08' && cst !== '49') {
    return '08';
  }

  return cst;
}

function getBaseIcms(item: NFeItem): number {
  return Number(item.vBC ?? item.baseCalculoIcms ?? item.valorTotal ?? 0);
}

function getAliqIcms(item: NFeItem): number {
  return Number(item.pICMS ?? item.aliquotaIcms ?? 0);
}

function getValorIcms(item: NFeItem): number {
  const informado = item.vICMS ?? item.valorIcms;
  if (informado !== undefined && informado !== null) return Number(informado);
  return (getBaseIcms(item) * getAliqIcms(item)) / 100;
}

function calcularTributoPercentual(
  valorInformado: number | null | undefined,
  base: number,
  aliquota: number
): number {
  const valor = Number(valorInformado ?? 0);
  if (valor > 0) return valor;
  return (base * aliquota) / 100;
}

function validateCest(item: NFeItem, hasST: boolean): string {
  const cest = onlyDigits(item.cest);

  if (!cest || cest === '0000000') {
    if (hasST) {
      throw new Error(`Item ${item.numeroItem}: operacao com ICMS-ST exige CEST valido.`);
    }
    return '';
  }

  if (cest.length !== 7) {
    throw new Error(`Item ${item.numeroItem}: CEST deve conter 7 digitos.`);
  }

  return cest;
}

function hasIcmsST(item: NFeItem, crt: CRT): boolean {
  const csosn = clean(item.csosn);
  const cst = normalizarCSTICMS(item.cstIcms || item.cst);
  return [201, 202, 203].map(String).includes(csosn) || ['10', '30', '70'].includes(cst) || Boolean(item.vBCST || item.vICMSST);
}

export function getCestXml(item: NFeItem, crt: CRT): string {
  const cest = validateCest(item, hasIcmsST(item, crt));
  return cest ? tag('CEST', cest) : '';
}

export function validarItemFiscal(item: NFeItem, crt: CRT): void {
  if (crt === 1 || crt === 4) {
    getCSOSN(item, crt);
    if (normalizarCSTICMS(item.cstIcms || item.cst) && !clean(item.csosn)) {
      throw new Error(`Item ${item.numeroItem}: CRT ${crt} nao permite CST ICMS sem CSOSN.`);
    }
  }

  if (crt === 2) {
    // CRT 2 depende de UF, sublimite e orientacao contabil. Aqui exigimos
    // escolha explicita: CST quando a operacao sair pelo regime normal, ou
    // CSOSN quando houver fundamento para manter regra do Simples.
    if (!normalizarCSTICMS(item.cstIcms || item.cst) && !clean(item.csosn)) {
      throw new Error(`Item ${item.numeroItem}: CRT 2 exige CST ICMS ou CSOSN definido explicitamente.`);
    }
  }

  if (crt === 3) {
    getCSTICMS(item);
    if (clean(item.csosn) && !normalizarCSTICMS(item.cstIcms || item.cst)) {
      throw new Error(`Item ${item.numeroItem}: CRT 3 nao permite CSOSN sem CST ICMS.`);
    }
  }

  validateCest(item, hasIcmsST(item, crt));
}

export function buildIcmsXmlPorCRT(item: NFeItem, crt: CRT): string {
  validarItemFiscal(item, crt);
  if (crt === 1 || crt === 4) return buildIcmsSN(item, crt);

  if (crt === 2) {
    // CRT 2: por excesso de sublimite, algumas operacoes passam a usar CST
    // como regime normal. Se o item trouxer CST, ele prevalece. Se trouxer
    // apenas CSOSN, mantemos a emissao explicita pelo grupo SN sem default.
    return normalizarCSTICMS(item.cstIcms || item.cst) ? buildIcmsRegimeNormal(item) : buildIcmsSN(item, crt);
  }

  return buildIcmsRegimeNormal(item);
}

function buildIcmsSN(item: NFeItem, crt: CRT): string {
  const orig = getOrigem(item);
  const csosn = getCSOSN(item, crt);
  const common = tag('orig', orig) + tag('CSOSN', csosn);

  switch (csosn) {
    case '101':
      return `<ICMSSN101>${common}${tag('pCredSN', fmt(item.pCredSN))}${tag('vCredICMSSN', fmt(item.vCredICMSSN))}</ICMSSN101>`;
    case '201':
      return `<ICMSSN201>${common}${stFields(item)}${tag('pCredSN', fmt(item.pCredSN))}${tag('vCredICMSSN', fmt(item.vCredICMSSN))}</ICMSSN201>`;
    case '202':
    case '203':
      return `<ICMSSN202>${common}${stFields(item)}</ICMSSN202>`;
    case '500':
      return `<ICMSSN500>${common}${tag('vBCSTRet', fmt(item.vBCSTRet))}${tag('pST', fmt(item.pST))}${tag('vICMSSubstituto', fmt(item.vICMSSubstituto))}${tag('vICMSSTRet', fmt(item.vICMSSTRet))}</ICMSSN500>`;
    case '900':
      return `<ICMSSN900>${common}${tag('modBC', clean(item.modBC) || '3')}${tag('vBC', fmt(item.vBC ?? item.baseCalculoIcms))}${tag('pRedBC', fmt(item.pRedBC))}${tag('pICMS', fmt(getAliqIcms(item)))}${tag('vICMS', fmt(item.vICMS ?? item.valorIcms))}</ICMSSN900>`;
    case '102':
    case '103':
    case '300':
    case '400':
    default:
      return `<ICMSSN102>${common}</ICMSSN102>`;
  }
}

function stFields(item: NFeItem): string {
  return tag('modBCST', clean(item.modBCST) || '4') +
    tag('pMVAST', fmt(item.pMVAST)) +
    tag('pRedBCST', fmt(item.pRedBCST)) +
    tag('vBCST', fmt(item.vBCST)) +
    tag('pICMSST', fmt(item.pICMSST)) +
    tag('vICMSST', fmt(item.vICMSST));
}

function buildIcmsRegimeNormal(item: NFeItem): string {
  const orig = getOrigem(item);
  const cst = getCSTICMS(item);
  const common = tag('orig', orig) + tag('CST', cst);
  const modBC = tag('modBC', clean(item.modBC) || '3');
  const vBC = tag('vBC', fmt(getBaseIcms(item)));
  const pICMS = tag('pICMS', fmt(getAliqIcms(item)));
  const vICMS = tag('vICMS', fmt(getValorIcms(item)));

  switch (cst) {
    case '00':
      return `<ICMS00>${common}${modBC}${vBC}${pICMS}${vICMS}</ICMS00>`;
    case '10':
      return `<ICMS10>${common}${modBC}${vBC}${pICMS}${vICMS}${stFields(item)}</ICMS10>`;
    case '20':
      return `<ICMS20>${common}${modBC}${tag('pRedBC', fmt(item.pRedBC))}${vBC}${pICMS}${vICMS}</ICMS20>`;
    case '30':
      return `<ICMS30>${common}${stFields(item)}</ICMS30>`;
    case '40':
    case '41':
    case '50':
      return `<ICMS40>${common}</ICMS40>`;
    case '51':
      return `<ICMS51>${common}${modBC}${tag('pRedBC', fmt(item.pRedBC))}${vBC}${pICMS}${vICMS}</ICMS51>`;
    case '60':
      return `<ICMS60>${common}${tag('vBCSTRet', fmt(item.vBCSTRet))}${tag('pST', fmt(item.pST))}${tag('vICMSSubstituto', fmt(item.vICMSSubstituto))}${tag('vICMSSTRet', fmt(item.vICMSSTRet))}</ICMS60>`;
    case '70':
      return `<ICMS70>${common}${modBC}${tag('pRedBC', fmt(item.pRedBC))}${vBC}${pICMS}${vICMS}${stFields(item)}</ICMS70>`;
    case '90':
      return `<ICMS90>${common}${modBC}${vBC}${pICMS}${vICMS}</ICMS90>`;
  }
}

export function buildPisXmlPorCRT(item: NFeItem, crt: CRT): string {
  const cst = getCstPisCofinsPorCRT(item.cstPis, crt);
  const aliq = crt === 4 ? 0 : Number(item.aliquotaPis ?? 0);
  const vBC = Number(item.valorTotal ?? 0);
  const vPIS = calcularTributoPercentual(item.valorPis, vBC, aliq);

  if (CST_PIS_COFINS_TRIBUTADOS.has(cst) && aliq > 0) {
    return `<PIS><PISAliq>${tag('CST', cst)}${tag('vBC', fmt(vBC))}${tag('pPIS', fmt(aliq))}${tag('vPIS', fmt(vPIS))}</PISAliq></PIS>`;
  }

  if (CST_PIS_COFINS_NT.has(cst)) {
    return `<PIS><PISNT>${tag('CST', cst)}</PISNT></PIS>`;
  }

  return `<PIS><PISOutr>${tag('CST', cst)}${tag('vBC', fmt(0))}${tag('pPIS', fmt(0))}${tag('vPIS', fmt(0))}</PISOutr></PIS>`;
}

export function buildCofinsXmlPorCRT(item: NFeItem, crt: CRT): string {
  const cst = getCstPisCofinsPorCRT(item.cstCofins, crt);
  const aliq = crt === 4 ? 0 : Number(item.aliquotaCofins ?? 0);
  const vBC = Number(item.valorTotal ?? 0);
  const vCOFINS = calcularTributoPercentual(item.valorCofins, vBC, aliq);

  if (CST_PIS_COFINS_TRIBUTADOS.has(cst) && aliq > 0) {
    return `<COFINS><COFINSAliq>${tag('CST', cst)}${tag('vBC', fmt(vBC))}${tag('pCOFINS', fmt(aliq))}${tag('vCOFINS', fmt(vCOFINS))}</COFINSAliq></COFINS>`;
  }

  if (CST_PIS_COFINS_NT.has(cst)) {
    return `<COFINS><COFINSNT>${tag('CST', cst)}</COFINSNT></COFINS>`;
  }

  return `<COFINS><COFINSOutr>${tag('CST', cst)}${tag('vBC', fmt(0))}${tag('pCOFINS', fmt(0))}${tag('vCOFINS', fmt(0))}</COFINSOutr></COFINS>`;
}

export function calcularTotaisNFe(itens: NFeItem[], crt: CRT): TotaisNFe {
  return itens.reduce<TotaisNFe>((acc, item) => {
    validarItemFiscal(item, crt);

    const vProd = Number(item.valorTotal ?? 0);
    acc.vProd += vProd;

    const cst = normalizarCSTICMS(item.cstIcms || item.cst);
    const usaCstNormal = crt === 3 || (crt === 2 && cst);
    if (usaCstNormal && ['00', '10', '20', '51', '70', '90'].includes(cst)) {
      acc.vBC += getBaseIcms(item);
      acc.vICMS += getValorIcms(item);
    }

    const cstPis = getCstPisCofinsPorCRT(item.cstPis, crt);
    const aliquotaPis = crt === 4 ? 0 : Number(item.aliquotaPis ?? 0);
    if (CST_PIS_COFINS_TRIBUTADOS.has(cstPis) && aliquotaPis > 0) {
      acc.vPIS += calcularTributoPercentual(item.valorPis, vProd, aliquotaPis);
    }

    const cstCofins = getCstPisCofinsPorCRT(item.cstCofins, crt);
    const aliquotaCofins = crt === 4 ? 0 : Number(item.aliquotaCofins ?? 0);
    if (CST_PIS_COFINS_TRIBUTADOS.has(cstCofins) && aliquotaCofins > 0) {
      acc.vCOFINS += calcularTributoPercentual(item.valorCofins, vProd, aliquotaCofins);
    }

    return acc;
  }, { vProd: 0, vBC: 0, vICMS: 0, vPIS: 0, vCOFINS: 0 });
}
