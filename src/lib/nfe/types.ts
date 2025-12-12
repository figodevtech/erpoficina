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
  regimetributario: "1" | "2" | "3" | string;
  certificadocaminho: string | null;
  cschomologacao: string | null;
  cscproducao: string | null;
  ambiente: "HOMOLOGACAO" | "PRODUCAO" | null;
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
  crt: "1" | "2" | "3" | string;
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
  indIEDest: "1" | "2" | "3" | "9" | string;
  inscricaoEstadual?: string;
  endereco: NFeEndereco;
};

export interface NFeItem {
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

  // ---------- ICMS ----------
  /**
   * CST genérico de ICMS (espelha coluna `cst` da tabela produto/nfe_item).
   * Ex.: "00", "20", "10"...
   */
  cst?: string | null;

  /**
   * CST de ICMS (nome mais explícito, se você quiser usar também).
   * Pode espelhar o mesmo valor de `cst`.
   */
  cstIcms?: string | null;

  /**
   * CSOSN (para Simples Nacional)
   * Ex.: "101", "102", "103"...
   */
  csosn?: string | null;

  /**
   * Alíquota de ICMS em percentual (ex.: 18 => 18%)
   */
  aliquotaIcms?: number;

  /**
   * Base de cálculo de ICMS (vBC) – opcional, hoje calculamos em cima do valorTotal.
   */
  baseCalculoIcms?: number;

  /**
   * Valor de ICMS (vICMS) – opcional, hoje calculamos em cima do valorTotal.
   */
  valorIcms?: number;

  // ---------- PIS ----------
  /**
   * CST de PIS (ex.: "01", "07", "99"...)
   */
  cstPis?: string | null;

  /**
   * Alíquota de PIS em percentual (ex.: 0.65 => 0,65%)
   */
  aliquotaPis?: number;

  /**
   * Valor de PIS (vPIS)
   */
  valorPis?: number;

  // ---------- COFINS ----------
  /**
   * CST de COFINS (ex.: "01", "07", "99"...)
   */
  cstCofins?: string | null;

  /**
   * Alíquota de COFINS em percentual (ex.: 3 => 3%)
   */
  aliquotaCofins?: number;

  /**
   * Valor de COFINS (vCOFINS)
   */
  valorCofins?: number;
}
