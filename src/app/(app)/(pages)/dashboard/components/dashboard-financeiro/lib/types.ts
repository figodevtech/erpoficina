export type ResumoFinanceiro = {
  periodo: { inicio: string; fim: string };
  totais: { receita: number; despesa: number; saldo: number; receitaPendente: number };
  fluxoDiario: { data: string; receita: number; despesa: number; saldoAcumulado: number }[];
  porCategoria: { categoria: string; receita: number; despesa: number }[];
  porMetodoPagamento: { metodo: string; valor: number }[];
};

export type PropriedadesDashboardFinanceiro = {
  className?: string;
  endpoint?: string; // default: /api/transaction
  autoAtualizarMs?: number;
};

export type TipoSerieFluxo = "TODOS" | "ENTRADAS" | "SAIDAS" | "SALDO";
