import { Timestamp } from "next/dist/server/lib/cache-handlers/types"


enum TipoPessoa {
  FISICA = "FISICA",
  JURIDICA = "JURIDICA",
}

export enum ClientStatus {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
  PENDENTE = "PENDENTE",
}

export interface Customer {
  id: number
  tipopessoa: TipoPessoa
  cpfcnpj: string
  nomerazaosocial: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  inscricaoestadual: string
  inscricaomunicipal: string
  codigomunicipio: string
  createdat: string
  updatedat: Timestamp
  status: ClientStatus
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
  pageCount?: number
}

export enum Status {
  TODOS = "TODOS",
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
  PENDENTE = "PENDENTE",
}