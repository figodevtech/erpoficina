// types/setor.ts

/**
 * Tabela: public.setor
 *  - id: PK (serial/integer)
 *  - nome: string (NOT NULL)
 *  - descricao: string | null
 */
export interface Setor {
  id: number;
  nome: string;
  descricao?: string | null;
}
