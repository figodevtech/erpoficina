import { PERMS } from "./permission-constants";

const ROUTE_PRIORITY: Array<{ perm: string; href: string }> = [
  { perm: PERMS.DASHBOARD, href: "/dashboard" },
  { perm: PERMS.EXECUCAO_OS, href: "/execucao" },
  { perm: PERMS.ORDENS, href: "/ordens" },
  { perm: PERMS.CLIENTES, href: "/clientes" },
  { perm: PERMS.VEICULOS, href: "/veiculos" },
  { perm: PERMS.ESTOQUE, href: "/estoque" },
  { perm: PERMS.VENDAS, href: "/historicovendas" },
  { perm: PERMS.FINANCEIRO, href: "/fluxodecaixa" },
  { perm: PERMS.ACOMPANHAMENTO, href: "/acompanhamento" },
  { perm: PERMS.RELATORIOS, href: "/relatorios" },
  { perm: PERMS.CONFIG, href: "/configuracoes/geral" },
  { perm: PERMS.USUARIOS, href: "/usuarios" },
];

export function getDefaultRouteForPerms(permissoes: unknown, fallback = "/nao-autorizado") {
  const userPerms = new Set(
    (Array.isArray(permissoes) ? permissoes : [])
      .map((perm) => String(perm).trim().toUpperCase())
      .filter(Boolean)
  );

  return ROUTE_PRIORITY.find((route) => userPerms.has(route.perm))?.href ?? fallback;
}
