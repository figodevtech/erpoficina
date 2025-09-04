// types/osproduto.ts
export interface OSProduto {
  ordemservicoid: number;  // PK part, FK -> ordemservico(id)
  produtoid: number;       // PK part, FK -> produto(id)
  quantidade?: number | null;
  precounitario: number;   // numeric
  subtotal: number;        // numeric
}
