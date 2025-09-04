// types/veiculo.ts
export interface Veiculo {
  id: number;
  clienteid: number;         // FK -> cliente(id)
  placa: string;
  modelo: string;
  marca: string;
  ano?: number | null;
  cor?: string | null;
  kmatual?: number | null;
  createdat?: string | null;
  updatedat?: string | null;
}
