// types/movimentacaoestoque.ts
import type { EnumTipoMovimentacao } from './enum';

export interface MovimentacaoEstoque {
  id: number;
  produtoid: number;                 // FK -> produto(id)
  tipomovimentacao: EnumTipoMovimentacao; // USER-DEFINED
  quantidade: number;
  ordemservicoid?: number | null;    // FK -> ordemservico(id)
  fornecedorid?: number | null;      // FK -> fornecedor(id)
  datamovimentacao?: string | null;  // timestamp
  observacao?: string | null;
  createdat?: string | null;
  updatedat?: string | null;
}
