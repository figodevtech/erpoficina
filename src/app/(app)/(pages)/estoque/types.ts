export interface Produto {
  id: number;
  codigo?: string;
  descricao?: string;
  precounitario: number;
  estoque?: number; // default 0 no banco, mas pode ser null
  estoqueminimo?: number; // default 0 no banco, mas pode ser null
  ncm?: string;
  cfop?: string;
  unidade?: string;
  cest?: string;
  csosn?: string;
  aliquotaicms?: number;
  origem?: number;
  ean?: string;
  createdat?: string; // timestamp no banco, pode ser null
  updatedat?: string; // timestamp no banco, pode ser null
  referencia?: string;
  titulo?: string;
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
  pageCount?: number
}
