// types/osservico.ts
export interface OSServico {
  ordemservicoid: number;  // PK part, FK -> ordemservico(id)
  servicoid: number;       // PK part, FK -> servico(id)
  quantidade?: number | null;
  precounitario: number;   // numeric
  subtotal: number;        // numeric
}
