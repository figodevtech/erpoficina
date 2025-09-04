// types/empresa.ts
export interface Empresa {
  id: number;
  cnpj: string;
  razaosocial: string;
  nomefantasia?: string | null;
  inscricaoestadual?: string | null;
  inscricaomunicipal?: string | null;
  endereco: string;
  codigomunicipio: string;
  regimetributario: string;
  certificadocaminho?: string | null;
  cschomologacao?: string | null;
  cscproducao?: string | null;
  ambiente?: string | null;     // default 'HOMOLOGACAO'
  createdat?: string | null;
  updatedat?: string | null;
}
