import { Timestamp } from "next/dist/server/lib/cache-handlers/types"
import { Ordem } from "../ordens/types"
import { Veiculo } from "../veiculos/types"


enum TipoPessoa {
  FISICA = "FISICA",
  JURIDICA = "JURIDICA",
}

export enum ClientStatus {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
  PENDENTE = "PENDENTE",
}

export enum Cliente_rank{
  EXELENTE = "EXCELENTE",
  ALTO = "ALTO",
  NORMAL = "NORMAL",
  BAIXO = "BAIXO",
}


export interface Customer {
  id: number
  tipopessoa: TipoPessoa
  cpfcnpj: string
  nomerazaosocial: string
  email: string
  telefone: string
  endereco: string
  endereconumero: string
  enderecocomplemento: string
  cidade: string
  estado: string
  bairro: string
  cep: string
  inscricaoestadual: string
  inscricaomunicipal: string
  codigomunicipio: string
  createdat: string
  updatedat: Timestamp
  status: ClientStatus
  veiculos: Veiculo[]
  ordens: Ordem[]
  rank: Cliente_rank
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

export interface CardsProps {
    loadingStatusCounter: boolean
    totalCustomers: number
    statusCounts: Record<string, number>
}
