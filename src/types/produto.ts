// types/produto.ts
export interface Produto {
  id: number;
  codigo: string;
  descricao: string;
  precounitario: number;          // numeric
  estoque?: number | null;
  estoqueminimo?: number | null;
  ncm: string;
  cfop: string;
  unidade: string;
  cest?: string | null;
  csosn: string;
  aliquotaicms?: number | null;   // numeric
  origem: number;
  ean?: string | null;
  createdat?: string | null;
  updatedat?: string | null;
}
