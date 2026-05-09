/**
 * Constantes puras de permissoes.
 * Este arquivo nao importa auth/supabase e pode ser usado em client components.
 */
export const PERMS = {
  DASHBOARD: "DASHBOARD_ACESSO",
  CLIENTES: "CLIENTES_ACESSO",
  ORDENS: "ORDENS_ACESSO",
  ESTOQUE: "ESTOQUE_ACESSO",
  FINANCEIRO: "FINANCEIRO_ACESSO",
  RELATORIOS: "RELATORIOS_ACESSO",
  AGENDAMENTOS: "AGENDAMENTOS_ACESSO",

  CONFIG: "CONFIG_ACESSO",
  USUARIOS: "USUARIOS_ACESSO",

  ACOMPANHAMENTO: "ACOMPANHAMENTO_ACESSO",

  VENDAS: "VENDAS_ACESSO",

  VEICULOS: "VEICULOS_ACESSO",

  EXECUCAO_OS: "EXECUCAO_OS_ACESSO",
} as const;

export type Permission = (typeof PERMS)[keyof typeof PERMS];
