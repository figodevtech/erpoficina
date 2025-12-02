import { VendaComItens } from "../historicovendas/types";
import { OrdemServico } from "@/types/ordemservico";

export enum Estoque_status {
  CRITICO = "CRITICO",
  OK = "OK",
  BAIXO = "BAIXO",
  SEM_ESTOQUE ="SEM_ESTOQUE",
  TODOS = "TODOS",
}

export enum Grupo_produto {
  MOTOR = "MOTOR",
  INJECAO_ELETRONICA = "INJECAO ELETRONICA",
  IGNICAO = "IGNICAO",
  ARREFECIMENTO = "ARREFECIMENTO",
  AR_CONDICIONADO_CLIMATIZACAO = "AR CONDICIONADO/CLIMATIZACAO",
  LUBRIFICANTES_E_FLUIDOS = "LUBRIFICANTES E FLUIDOS",
  FILTROS = "FILTROS",
  TRANSMISSAO = "TRANSMISSAO",
  EMBREAGEM = "EMBREAGEM",
  DIFERENCIAL_E_EIXOS = "DIFERENCIAL E EIXOS",
  DIRECAO = "DIRECAO",
  SUSPENSAO = "SUSPENSAO",
  FREIOS = "FREIOS",
  PNEUS_E_RODAS = "PNEUS E RODAS",
  ESCAPAMENTO = "ESCAPAMENTO",
  ELETRICA = "ELETRICA",
  BATERIAS = "BATERIAS",
  ILUMINACAO_SINALIZACAO = "ILUMINACAO/SINALIZACAO",
  SENSORES_E_ATUADORES = "SENSORES E ATUADORES",
  INSTRUMENTOS_DE_MEDICAO = "INSTRUMENTOS DE MEDICAO",
  DIAGNOSTICO_E_SCANNER = "DIAGNOSTICO E SCANNER",
  CARROCERIA_LATARIA = "CARROCERIA/LATARIA",
  VIDROS_RETROVISORES = "VIDROS/RETROVISORES",
  INTERIOR_ACABAMENTOS = "INTERIOR ACABAMENTOS",
  JUNTAS_RETENTORES_ORINGS = "JUNTAS/RETENTORES ORINGS",
  CORREIAS_TENSORES = "CORREIAS/TENSORES",
  CABOS_E_MANGUEIRAS = "CABOS E MANGUEIRAS",
  FIXADORES_PARAFUSOS = "FIXADORES/PARAFUSOS",
  COLAS_E_SELANTES = "COLAS E SELANTES",
  ADITIVOS_E_QUIMICOS = "ADITIVOS E QUIMICOS",
  ESTETICA_LIMPEZA = "ESTETICA/LIMPEZA",
  MATERIAIS_PINTURA = "MATERIAIS/PINTURA",
  ABRASIVOS_LIXAS = "ABRASIVOS/LIXAS",
  FERRAMENTAS_MANUAIS = "FERRAMENTAS MANUAIS",
  FERRAMENTAS_ELETRICAS_PNEUMATICAS = "FERRAMENTAS ELETRICAS PNEUMATICAS",
  EQUIPAMENTOS_DE_OFICINA = "EQUIPAMENTOS DE OFICINA",
  EPI_SEGURANCA = "EPI/SEGURANCA",
  ORGANIZACAO_ARMAZENAGEM = "ORGANIZACAO/ARMAZENAGEM",
  ACESSORIOS = "ACESSORIOS",
  OUTROS = "OUTROS",
}


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
  ncm?: string;
  cfop?: string;
  unidade?: Unidade_medida;
  cest?: string;
  csosn?: string;
  aliquotaicms?: number;
  codigobarras?: string;
  createdat?: Date; // timestamp no banco, pode ser null
  updatedat?: Date; // timestamp no banco, pode ser null
  referencia?: string;
  titulo?: string;
  fornecedor?: string;
  fabricante?: string;
  grupo?: Grupo_produto; // grupo_produto no banco, default 'OUTROS'
  status_estoque?: Estoque_status;
  imgLink?: string;
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
