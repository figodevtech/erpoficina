// types/servico.ts
export interface Servico {
  id: number;
  codigo: string;
  descricao: string;
  precohora: number;                  // numeric
  codigoservicomunicipal: string;
  aliquotaiss?: number | null;        // numeric
  cnae?: string | null;
  itemlistaservico: string;
  tiposervicoid?: number | null;      // FK -> tiposervico(id)
  createdat?: string | null;
  updatedat?: string | null;
}
