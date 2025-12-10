"use client";

export type Empresa = {
  empresaId: number;
  cnpj: string;
  razaosocial: string;
  nomefantasia?: string;
  inscricaoestadual?: string;
  inscricaomunicipal?: string;
  inscricaoestadualst?: string;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  codigomunicipio: string;
  cep?: string;
  uf?: string;
  codigopais?: string;
  nomepais?: string;
  telefone?: string;
  cnae?: string;
  regimetributario: "1" | "2" | "3";
  ambiente: "HOMOLOGACAO" | "PRODUCAO";
  certificadocaminho?: string;
  certificadosenha?: string;
  cschomologacao?: string;
  cscproducao?: string;
};

export type NFeCfg = {
  serieNFe: string;
  serieNFCe?: string;
  cscHomologacao?: string;
  cscProducao?: string;
  idCSC?: string;
  naturezaOperacao: string;
};

export type NFSecfg = {
  provedor: string;
  inscricaoMunicipal?: string;
  serieRPS?: string;
  usuario?: string;
  senha?: string;
  token?: string;
  certificadoA1Base64?: string;
  senhaCertificado?: string;
};

export type CartaoCfg = {
  habilitado: boolean;
  provider: "stone";
  merchantId: string;
  apiKey: string;
  webhookUrl?: string;
  parcelasMax: number;
  capturaAutomatica: boolean;
  terminalIds?: string[];
};

export type PixCfg = {
  habilitado: boolean;
  provider: "stone" | "banco";
  chave: string;
  clientId?: string;
  clientSecret?: string;
  webhookUrl?: string;
  expiracaoSegundos: number;
};

export type DinheiroCfg = { habilitado: boolean };

export type FormValues = {
  empresa: Empresa;
  nfe: NFeCfg;
  nfse: NFSecfg;
  pagamentos: {
    cartao: CartaoCfg;
    pix: PixCfg;
    dinheiro: DinheiroCfg;
  };
};
