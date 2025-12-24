import { VendaComItens } from "../(vendas)/historicovendas/types";
import { OrdemServico } from "@/types/ordemservico";

export enum Estoque_status {
  CRITICO = "CRITICO",
  OK = "OK",
  BAIXO = "BAIXO",
  SEM_ESTOQUE ="SEM_ESTOQUE",
  TODOS = "TODOS",
}

export interface Grupo_produto {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
};


export enum Unidade_medida {
  UN = "UN",
  JGO = "JGO",
  KIT = "KIT",
  PAR = "PAR",
  CX = "CX",
  PCT = "PCT",
}

export interface Produtoentrada{
  id: number;
  fornecedorid: number;
  quantidade: number;
  created_at: Date;
  fornecedor: Fornecedor;
  fiscal: boolean;
  notachave?: string;
}

export interface Vendaproduto {
  id: number;
  created_at: Date;
  updated_at: Date;
  venda_id: number;
  produtoid: number;
  sub_total: number;
  valor_total: number;
  valor_desconto: number;
  tipo_desconto: number;
  quantidade: number;
  venda: VendaComItens

}

export interface OSProduto {
  id: number;
  ordemservicoid: number;
  quantidade: number;
  precounitario: number;
  subtotal: number;
  ordem: OrdemServico
}

export interface Fornecedor {
   id: number; 
  cpfcnpj?: string; 
  nomerazaosocial: string; 
  nomefantasia?: string; 
  endereco ?: string; 
  cidade?: string; 
  estado?: string; 
  cep?: string; 
  contato?: string; 
  createdat?: Date
  updatedat?: Date
  endereconumero?: string; 
  enderecocomplemento?: string; 
  bairro?: string; 
}

export interface Produto {
  id?: number;
  precovenda?: number;
  descricao?: string;
  estoque?: number; // default 0 no banco, mas pode ser null
  estoqueminimo?: number; // default 0 no banco, mas pode ser null
  unidade?: Unidade_medida;
  ncm?: string;
  cfop?: string;
  cst?: string;
  cest?: string;
  csosn?: string;
  aliquotaicms?: number;
  cst_pis?: string;
  aliquota_pis?: number;
  cst_cofins?: string;
  aliquota_cofins?: number;
  codigobarras?: string;
  createdat?: Date; // timestamp no banco, pode ser null
  updatedat?: Date; // timestamp no banco, pode ser null
  referencia?: string;
  titulo?: string;
  fornecedor?: string;
  fabricante?: string;
  grupo?: Grupo_produto; // grupo_produto no banco, default 'OUTROS'
  grupo_produto_id?: number;
  status_estoque?: Estoque_status;
  imgUrl?: string;
  exibirPdv?: boolean;
  tituloMarketplace?: string;
  descricaoMarketplace?: string;
  entradas?: Produtoentrada[]
  vendasdoproduto?: Vendaproduto[];
  ordensdoproduto?: OSProduto[];
  fornecedorid?: number;
  codigofornecedor?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pageCount?: number;
}
