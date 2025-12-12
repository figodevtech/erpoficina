// src/lib/nfe/types.ts

// =====================
// Tabela EMPRESA (Supabase)
// =====================
export type EmpresaRow = {
  id: number;
  cnpj: string;
  razaosocial: string;
  nomefantasia: string | null;
  inscricaoestadual: string | null;
  inscricaomunicipal: string | null;
  endereco: string;
  codigomunicipio: string;
  regimetributario: '1' | '2' | '3' | string;
  certificadocaminho: string | null;
  cschomologacao: string | null;
  cscproducao: string | null;
  ambiente: 'HOMOLOGACAO' | 'PRODUCAO' | null;
  createdat: string | null;
  updatedat: string | null;
  bairro: string | null;
  numero: string | null;
  complemento: string | null;
  cep: string | null;
  uf: string | null;
  codigopais: string | null;
  nomepais: string | null;
  telefone: string | null;
  cnae: string | null;
  inscricaoestadualst: string | null;
  certificadosenha: string | null;
};

// =====================
// Tabela CLIENTE (Supabase)
// =====================
export type ClienteRow = {
  id: number;
  tipopessoa?: string | null;
  cpfcnpj: string;
  nomerazaosocial: string;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  endereconumero?: string | null;
  enderecocomplemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  inscricaoestadual?: string | null;
  inscricaomunicipal?: string | null;
  codigomunicipio?: string | null;
};

// =====================
// Tipos de NF-e
// =====================

export type NFeEndereco = {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  codigoMunicipio: string;
  nomeMunicipio: string;
  uf: string;
  cep: string;
  codigoPais: string;
  nomePais: string;
  telefone?: string;
};

export type NFeEmitente = {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual: string;
  inscricaoEstadualST?: string;
  inscricaoMunicipal?: string;
  cnae?: string;
  crt: '1' | '2' | '3' | string;
  endereco: NFeEndereco;
};

export type NFeIde = {
  cUF: string;
  cNF: string;
  natOp: string;
  mod: string;
  serie: number;
  nNF: number;
  dhEmi: string;
  tpNF: 0 | 1;
  idDest: 1 | 2 | 3;
  cMunFG: string;
  tpImp: 1 | 2 | 3 | 4 | 5;
  tpEmis: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  cDV: string;
  tpAmb: 1 | 2;
  finNFe: 1 | 2 | 3 | 4;
  indFinal: 0 | 1;
  indPres: 0 | 1 | 2 | 3 | 4 | 9;
  procEmi: 0 | 1 | 2 | 3;
  verProc: string;
};

export type NFeDestinatario = {
  cpf?: string;
  cnpj?: string;
  razaoSocial: string;
  indIEDest: '1' | '2' | '3' | '9' | string;
  inscricaoEstadual?: string;
  endereco: NFeEndereco;
};

/**
 * Representa UM item da NF-e.
 *
 * Para funcionar bem em TODOS os regimes:
 *
 * - Simples Nacional:
 *   - Preencha `regimeTributario = 'SIMPLES_NACIONAL'`
 *   - Preencha `csosn` (ex: "102", "103", ...)
 *
 * - Lucro Presumido / Regime Normal:
 *   - Preencha `regimeTributario = 'LUCRO_PRESUMIDO'` (ou 'LUCRO_REAL')
 *   - ICMS:
 *     - `origemMercadoria` ("0" nacional, etc)
 *     - `cstIcms` (ex: "00")
 *     - `modalidadeBCIcms` (geralmente "3" = valor da operação)
 *     - `baseCalculoIcms` (vBC) — se não preencher, usa `valorTotal`
 *     - `aliquotaIcms` (pICMS)
 *     - `valorIcms` (vICMS) — se não preencher, é calculado vBC * pICMS / 100
 *   - PIS:
 *     - `cstPis` (ex: "01", "02", "06", "07"...)
 *     - `baseCalculoPis` (se faltar, usa `valorTotal`)
 *     - `aliquotaPis` (pPIS)
 *     - `valorPis` (vPIS) — calculado se não vier pronto
 *   - COFINS:
 *     - `cstCofins`
 *     - `baseCalculoCofins`
 *     - `aliquotaCofins`
 *     - `valorCofins`
 */
export interface NFeItem {
  // Dados básicos do produto
  numeroItem: number;
  codigoProduto: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  codigoBarras?: string | null;

  /**
   * Regime tributário do emitente, para ajudar nas decisões de
   * montagem do bloco <imposto>.
   *
   * - 'SIMPLES_NACIONAL' → usa CSOSN / ICMSSN102, etc
   * - 'LUCRO_PRESUMIDO'  → ICMS normal (ICMS00, ICMS20...) + PIS/COFINS Alíquota
   * - 'LUCRO_REAL'       → também regime normal (tratado como normal aqui)
   */
  regimeTributario?:
    | 'SIMPLES_NACIONAL'
    | 'LUCRO_PRESUMIDO'
    | 'LUCRO_REAL';

  // -------- ICMS - Simples Nacional (CSOSN) --------
  /**
   * Se preenchido, o helper gera <ICMSSN102> (ou similar) automaticamente.
   */
  csosn?: string | null;

  // -------- ICMS - Regime Normal (Lucro Presumido / Real) --------
  /**
   * 0 = Nacional, 1 = Estrangeira importação direta, etc.
   * Se não informado, assume "0".
   */
  origemMercadoria?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

  /**
   * CST do ICMS (00, 20, 40, 41, 60, 90...).
   * Para Lucro Presumido simples: normalmente "00".
   */
  cstIcms?: string | null;

  /**
   * Modalidade da BC do ICMS:
   * - 0 = Margem Valor Agregado (%)
   * - 1 = Pauta (valor)
   * - 2 = Preço Tabelado Máx.
   * - 3 = Valor da operação (mais comum)
   */
  modalidadeBCIcms?: '0' | '1' | '2' | '3';

  /** Base de cálculo do ICMS (vBC). Se não informado, usa valorTotal. */
  baseCalculoIcms?: number | null;

  /** Alíquota do ICMS (pICMS, em %) */
  aliquotaIcms?: number | null;

  /** Valor do ICMS (vICMS). Se não informado, é calculado de vBC * pICMS / 100. */
  valorIcms?: number | null;

  // -------- PIS --------
  /**
   * CST do PIS:
   * - 01, 02 => PISAliq
   * - 03 => PISQtde
   * - 04~09 => PISNT / PISOutr
   */
  cstPis?: string | null;

  /** vBC do PIS. Se não informado, usa valorTotal. */
  baseCalculoPis?: number | null;

  /** Alíquota do PIS (%). */
  aliquotaPis?: number | null;

  /** Valor do PIS (vPIS). Se não informado, é calculado. */
  valorPis?: number | null;

  // -------- COFINS --------
  /**
   * CST do COFINS:
   * - 01, 02 => COFINSAliq
   * - 03 => COFINSQtde
   * - 04~09 => COFINSNT / COFINSOutr
   */
  cstCofins?: string | null;

  /** vBC do COFINS. Se não informado, usa valorTotal. */
  baseCalculoCofins?: number | null;

  /** Alíquota do COFINS (%). */
  aliquotaCofins?: number | null;

  /** Valor do COFINS (vCOFINS). Se não informado, é calculado. */
  valorCofins?: number | null;
}
