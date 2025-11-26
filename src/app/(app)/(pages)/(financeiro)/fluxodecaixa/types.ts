export enum Tipo_transacao {
  RECEITA = "RECEITA",
  DESPESA = "DESPESA",
  DEPOSITO = "DEPOSITO",
  SAQUE = "SAQUE",
}

export enum Categoria_transacao {
  SERVICO = "SERVICO",
  PRODUTO = "PRODUTO",
  TRANSPORTE_LOGISTICA = "TRANSPORTE_LOGISTICA",
  COMISSAO_REPASSE = "COMISSAO_REPASSE",
  TRANSFERENCIA = "TRANSFERENCIA",
  ALUGUEL = "ALUGUEL",
  EQUIPAMENTO_FERRAMENTA = "EQUIPAMENTO_FERRAMENTA",
  OUTROS = "OUTROS",
  PECA = "PECA",
  SALARIO = "SALARIO",
  IMPOSTO_TAXA = "IMPOSTO_TAXA",
  UTILIDADE = "UTILIDADE",
  ORDEM_SERVICO = "ORDEM_SERVICO",
  VENDA = "VENDA"
}

export enum Metodo_pagamento {
  PIX = "PIX",
  CREDITO = "CREDITO",
  DEBITO = "DEBITO",
  BOLETO = "BOLETO",
  TRANSFERENCIA = "TRANSFERENCIA",
  DINHEIRO = "DINHEIRO",
}

export enum Banco_tipo {
  CORRENTE = "CORRENTE",
  POUPANCA = "POUPANCA",
  DIGITAL = "DIGITAL",
  PAGAMENTO = "PAGAMENTO",
  SALARIO = "SALARIO",
  EMPRESARIAL = "EMPRESARIAL",
}

export interface TransactionCustomer {
  id: number;
  nome: string;
  cpfcnpj: string;
}

export interface Banco {
  id: number;
  titulo: string;
  valorinicial: number;
  agencia: string;
  contanumero: string;
  tipo: Banco_tipo;
  proprietario: string;
}

export interface Transaction {
  id: number;
  descricao: string;
  valor: number;
  valorLiquido: number;
  data: Date;
  metodopagamento: Metodo_pagamento;
  categoria: Categoria_transacao;
  tipo: Tipo_transacao;
  cliente_id?: number;
  banco_id: number;
  banco: Banco;
  nomepagador?: string;
  cpfcnpjpagador?: string;
  ordemservicoid?: number | null
  vendaid?: number | null

}
export interface NewTransaction {
  id?: number;
  descricao?: string;
  valor?: number | 0;
  valorLiquido?: number | 0;
  data?: Date;
  metodopagamento?: Metodo_pagamento;
  categoria?: Categoria_transacao;
  tipo?: Tipo_transacao;
  cliente_id?: number | null;
  banco_id?: number;
  banco?: Banco;
  ordemservicoid?: number | null
  vendaid?: number | null
  nomepagador?: string;
  cpfcnpjpagador?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pageCount?: number;
}

export interface StatusInfo {
  mesAtual: {
    somaReceitas: number;
    somaDespesas: number;
    year: number;
    month: number;
  };

  mesAnterior: {
    somaReceitas: number;
    somaDespesas: number;
    year: number;
    month: number;
  };
}
