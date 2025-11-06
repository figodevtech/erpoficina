import { Transaction } from "../(financeiro)/fluxodecaixa/types";

export type ID = number | string;

export type StatusOS =
  | "TODAS"
  | "ORCAMENTO"
  | "APROVACAO_ORCAMENTO"
  | "ORCAMENTO_APROVADO"
  | "ORCAMENTO_RECUSADO"
  | "EM_ANDAMENTO"
  | "PAGAMENTO"
  | "CONCLUIDO"
  | "CANCELADO";

export type Cliente = {
  id: number;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  documento?: string | null; // CPF/CNPJ
};

export type Veiculo = {
  id: number;
  placa: string;
  modelo: string;
  marca?: string;
  ano?: number | null;
  clienteid?: number;
};

export type Ordem = {
  id: number;
  numero?: string;
  status?: StatusOS | null;
  setor?: { id: number; nome: string } | null;
  responsavel?: { id: number; nome: string } | null;
  tecnicoid?: string | null; // se mantiver
  descricao?: string | null;
  observacoes?: string | null;
  cliente?: Cliente | null;
  veiculo?: Veiculo | null;
  checklistTemplateId?: string | null;
  orcamentototal:number;
  transacoes: Transaction[] | null
};

export type OrcamentoTotais = {
  totalProdutos: number;
  totalServicos: number;
  totalGeral: number;
};
