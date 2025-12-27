
export enum Veiculo_tipos {
  CARROS = "CARROS",
  MOTOS ="MOTOS",
  CAMINHOES ="CAMINHOES",
}
export interface Veiculo {
  id?: number,
  clienteid?: number,
  placa?: string,
  modelo?: string,
  modeloId?: number,
  marca?: string,
  marcaId?: number,
  ano?: number,
  cor?: string,
  kmatual?: number,
  tipo?: Veiculo_tipos
}