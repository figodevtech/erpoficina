// types/cliente.ts
import type { EnumTipoPessoa } from './enum';

export interface Cliente {
  id: number;
  tipopessoa: EnumTipoPessoa;     // USER-DEFINED
  cpfcnpj: string;
  nomerazaosocial: string;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  inscricaoestadual?: string | null;
  inscricaomunicipal?: string | null;
  codigomunicipio?: string | null;
  createdat?: string | null;
  updatedat?: string | null;
}
