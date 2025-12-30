import { Customer } from "../../clientes/types";
import { Produto } from "../../estoque/types";

export interface StatusMetrics {
  totalValor: number;
  totalSubTotal: number;
  totalDesconto: number;
  totalPedidos: number;
  ticketMedio: number;
}

export interface VendaStatusMetricsData {
  period: {
    month: string;
    start: string;
    end: string;
  };
  totals: StatusMetrics;
  byStatus: {
    abertas?: StatusMetrics;
    finalizadas?: StatusMetrics;
    canceladas?: StatusMetrics;
    pagamento?: StatusMetrics;
    [key: string]: StatusMetrics | undefined; // fallback pra outros status
  };
}

export interface VendaProdutoItem {
  id: number;
  produto: Produto;
  produtoid: number;
  sub_total: number;
  quantidade: number;
  valor_total: number;
  tipo_desconto: string | null;
  valor_desconto: number;
}

export enum vendaStatus {
  ABERTA = "ABERTA",
  PAGAMENTO = "PAGAMENTO",
  FINALIZADA = "FINALIZADA",
  CANCELADA = "CANCELADA",
}

export interface VendaComItens {
  id: number;
  clienteid: number;
  valortotal: number;
  cliente: Customer
  status: vendaStatus;
  datavenda: string;
  createdat: string | null;
  updatedat: string | null;
  created_by: string | null; // uuid
  desconto_tipo: string | null;
  desconto_valor: number;
  sub_total: number;
  itens: VendaProdutoItem[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pageCount?: number;
}