// types/pagamento.ts
import type { EnumTipoPagamento } from './enum';

export interface Pagamento {
  id: number;
  ordemservicoid?: number | null;  // FK -> ordemservico(id)
  vendaonlineid?: number | null;   // FK -> vendaonline(id)
  tipo: EnumTipoPagamento;         // USER-DEFINED
  valor: number;                   // numeric
  datapagamento?: string | null;   // timestamp
  comprovante?: string | null;
  status: string;                  // livre no schema
  createdat?: string | null;
  updatedat?: string | null;
}
