import { Timestamp } from "next/dist/server/lib/cache-handlers/types"
import { Ordem } from "../ordens/types"


enum TipoPessoa {
  FISICA = "FISICA",
  JURIDICA = "JURIDICA",
}

export enum ClientStatus {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
  PENDENTE = "PENDENTE",
}

export interface Vehicle {
  id: number,
  clientId: number,
  placa: string,
  modelo: string,
  marca: string
  ano: number,
  cor: string, 
  kmatual: number,
  
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
  veiculos: Vehicle[]
  ordens: Ordem[]
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
