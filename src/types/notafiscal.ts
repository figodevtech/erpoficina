// types/notafiscal.ts
export interface NotaFiscal {
  id: number;
  ordemservicoid?: number | null;  // FK -> ordemservico(id)
  vendaonlineid?: number | null;   // FK -> vendaonline(id)
  tipo: string;
  numero: string;
  serie: string;
  dataemissao?: string | null;     // timestamp
  xml?: string | null;
  protocolo?: string | null;
  status: string;
  createdat?: string | null;
  updatedat?: string | null;
}
