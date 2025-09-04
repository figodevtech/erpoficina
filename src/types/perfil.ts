// types/perfil.ts
import type { EnumPermissoes } from "./permissao";

/**
 * Tabela: public.perfil
 *  - id: PK (identity)
 *  - nome: string (UNIQUE)
 *  - descricao: string | null
 *  - createdat / updatedat: timestamps
 */
export interface Perfil {
  id: number;
  nome: string;
  descricao?: string | null;
  createdat?: string | null;
  updatedat?: string | null;
}

/**
 * Tabela de junção: public.perfilpermissao
 *  - perfilid: FK -> perfil(id)
 *  - permissaoid: FK -> permissao(id)
 *  - createdat: timestamp
 *
 * Observação: a combinação (perfilid, permissaoid) é PK no banco.
 */
export interface PerfilPermissao {
  perfilid: number;
  permissaoid: number;
  createdat?: string | null;
}

/**
 * Conveniência no front: Perfil com as permissões resolvidas por nome (EnumPermissoes).
 * Útil para montar telas/checkboxes sem ter que juntar manualmente.
 */
export interface PerfilComPermissoes extends Perfil {
  permissoes: EnumPermissoes[];
}
