// types/fornecedor.ts
export interface Fornecedor {
  id: number;
  cnpj: string;
  razaosocial: string;
  nomefantasia?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  contato?: string | null;
  createdat?: string | null;
  updatedat?: string | null;
}
