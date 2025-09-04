// types/enums.ts

/** Enums conhecidos (fixos) */
export type EnumPermissoes =
  | 'USUARIOS_GERENCIAR'
  | 'ORDENSERVICO_GERENCIAR'
  | 'ESTOQUE_GERENCIAR'
  | 'FINANCEIRO_GERENCIAR';

/** Enums USER-DEFINED (placeholder = string). Ajuste depois conforme o seu banco. */
export type EnumTipoPessoa = string;          // ex.: 'FISICA' | 'JURIDICA'
export type EnumStatusChecklist = string;     // ex.: 'PENDENTE' | 'OK'
export type EnumTipoMovimentacao = string;    // ex.: 'ENTRADA' | 'SAIDA'
export type EnumTipoOS = string;              // ex.: 'INTERNA' | 'EXTERNA'
export type EnumStatusOS = string;            // default no banco: 'ABERTA'
export type EnumStatusAprovacao = string;     // default no banco: 'PENDENTE'
export type EnumTipoPagamento = string;       // ex.: 'DINHEIRO' | 'PIX' | 'CARTAO'
export type EnumStatusVendaOnline = string;   // ex.: 'PENDENTE' | 'PAGO' | 'CANCELADO'
