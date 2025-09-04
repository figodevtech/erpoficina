// types/tiposervico.ts
export interface TipoServico {
  id: number;
  nome: string;
  descricao?: string | null;
  categoriaid: number; // FK -> categoriaservico(id)
}
