// types/vendaonlineitem.ts
export interface VendaOnlineItem {
  vendaonlineid: number;   // PK part, FK -> vendaonline(id)
  produtoid: number;       // PK part, FK -> produto(id)
  servicoid: number;       // PK part, FK -> servico(id)
  quantidade?: number | null;
  precounitario: number;   // numeric
  subtotal: number;        // numeric
}
