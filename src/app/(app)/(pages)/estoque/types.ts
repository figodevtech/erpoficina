export enum Estoque_status {
  CRITICO = "CRITICO",
  OK = "OK",
  BAIXO = "BAIXO",
  TODOS = "TODOS",
}

export enum Grupo_produto {
  MOTOR = "MOTOR",
  INJECAO_ELETRONICA = "INJECAO_ELETRONICA",
  IGNICAO = "IGNICAO",
  ARREFECIMENTO = "ARREFECIMENTO",
  AR_CONDICIONADO_CLIMATIZACAO = "AR_CONDICIONADO_CLIMATIZACAO",
  LUBRIFICANTES_E_FLUIDOS = "LUBRIFICANTES_E_FLUIDOS",
  FILTROS = "FILTROS",
  TRANSMISSAO = "TRANSMISSAO",
  EMBREAGEM = "EMBREAGEM",
  DIFERENCIAL_E_EIXOS = "DIFERENCIAL_E_EIXOS",
  DIRECAO = "DIRECAO",
  SUSPENSAO = "SUSPENSAO",
  FREIOS = "FREIOS",
  PNEUS_E_RODAS = "PNEUS_E_RODAS",
  ESCAPAMENTO = "ESCAPAMENTO",
  ELETRICA = "ELETRICA",
  BATERIAS = "BATERIAS",
  ILUMINACAO_SINALIZACAO = "ILUMINACAO_SINALIZACAO",
  SENSORES_E_ATUADORES = "SENSORES_E_ATUADORES",
  INSTRUMENTOS_DE_MEDICAO = "INSTRUMENTOS_DE_MEDICAO",
  DIAGNOSTICO_E_SCANNER = "DIAGNOSTICO_E_SCANNER",
  CARROCERIA_LATARIA = "CARROCERIA_LATARIA",
  VIDROS_RETROVISORES = "VIDROS_RETROVISORES",
  INTERIOR_ACABAMENTOS = "INTERIOR_ACABAMENTOS",
  JUNTAS_RETENTORES_ORINGS = "JUNTAS_RETENTORES_ORINGS",
  CORREIAS_TENSORES = "CORREIAS_TENSORES",
  CABOS_E_MANGUEIRAS = "CABOS_E_MANGUEIRAS",
  FIXADORES_PARAFUSOS = "FIXADORES_PARAFUSOS",
  COLAS_E_SELANTES = "COLAS_E_SELANTES",
  ADITIVOS_E_QUIMICOS = "ADITIVOS_E_QUIMICOS",
  ESTETICA_LIMPEZA = "ESTETICA_LIMPEZA",
  MATERIAIS_PINTURA = "MATERIAIS_PINTURA",
  ABRASIVOS_LIXAS = "ABRASIVOS_LIXAS",
  FERRAMENTAS_MANUAIS = "FERRAMENTAS_MANUAIS",
  FERRAMENTAS_ELETRICAS_PNEUMATICAS = "FERRAMENTAS_ELETRICAS_PNEUMATICAS",
  EQUIPAMENTOS_DE_OFICINA = "EQUIPAMENTOS_DE_OFICINA",
  EPI_SEGURANCA = "EPI_SEGURANCA",
  ORGANIZACAO_ARMAZENAGEM = "ORGANIZACAO_ARMAZENAGEM",
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

export interface Produto {
  id: number;
  precovenda: number;
  descricao?: string;
  estoque?: number; // default 0 no banco, mas pode ser null
  estoqueminimo?: number; // default 0 no banco, mas pode ser null
  ncm?: string;
  cfop?: string;
  unidade: Unidade_medida;
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
  status_estoque: Estoque_status;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pageCount?: number;
}
