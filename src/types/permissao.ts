// types/permissao.ts

/**
 * Espelha seu enum do Postgres: enumpermissoes
 * Se você adicionar novos valores no banco, inclua aqui também.
 */
export type EnumPermissoes = string;

/**
 * Tabela: public.permissao
 *  - id: PK (serial / integer)
 *  - nome: EnumPermissoes (UNIQUE no banco)
 *  - descricao: texto opcional
 */
export interface Permissao {
  id: number;
  nome: EnumPermissoes;
  descricao?: string | null;
}
