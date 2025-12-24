// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { PERMS, type Permission } from "@/app/api/_authz/perms";

const PUBLIC_PATHS = [
  "/login",
  "/recuperar-senha",
  "/os",
  // NextAuth
  "/api/auth",
];

// ✅ APIs públicas (adicione aqui as que podem sem login)
const PUBLIC_API_PREFIXES = [
  "/api/auth/check-email",
  "/api/auth/send-recovery",
  // ex: "/api/public",

  "/api/ordens/aprovacao"
];

function isStaticAsset(pathname: string) {
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images")
  ) {
    return true;
  }
  return /\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map)$/.test(pathname);
}

function isPublicPath(pathname: string) {
  if (isStaticAsset(pathname)) return true;
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isPublicApi(pathname: string) {
  if (!pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/api/auth")) return true; // NextAuth sempre público
  return PUBLIC_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/**
 * Regras por prefixo -> permissão necessária
 */
const ROUTE_PERMS: Array<{ prefix: string; perm: Permission }> = [
  { prefix: "/dashboard", perm: PERMS.DASHBOARD },
  { prefix: "/clientes", perm: PERMS.CLIENTES },
  { prefix: "/ordens", perm: PERMS.ORDENS },
  { prefix: "/estoque", perm: PERMS.ESTOQUE },
  { prefix: "/relatorios", perm: PERMS.RELATORIOS },

  { prefix: "/configuracoes", perm: PERMS.CONFIG },
  { prefix: "/configuracoes/perfis", perm: PERMS.CONFIG },
  { prefix: "/usuarios", perm: PERMS.USUARIOS },
  { prefix: "/acompanhamento", perm: PERMS.ACOMPANHAMENTO },

  { prefix: "/fluxodecaixa", perm: PERMS.FINANCEIRO },
  { prefix: "/pagamentodeordens", perm: PERMS.FINANCEIRO },
  { prefix: "/pagamentodevendas", perm: PERMS.FINANCEIRO },

  { prefix: "/historicovendas", perm: PERMS.VENDAS },
  { prefix: "/pdv", perm: PERMS.VENDAS },
  { prefix: "/vendas", perm: PERMS.VENDAS },

  { prefix: "/acompanhamento", perm: PERMS.ACOMPANHAMENTO },
];

function matchRule(pathname: string) {
  return ROUTE_PERMS.find((r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/"));
}

function hasPermFromSession(user: any, perm: string) {
  const perms: string[] = Array.isArray(user?.permissoes) ? user.permissoes : [];
  const normalized = perms.map((p) => String(p).trim().toUpperCase());
  return normalized.includes(String(perm).trim().toUpperCase());
}

export default auth(async (req: NextRequest & { auth?: any }) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // ignora assets
  if (isStaticAsset(pathname)) return NextResponse.next();

  const session = req.auth;
  const user = session?.user;

  const isLoggedIn = !!user;
  const isInactive = !!user && user.ativo === false;

  const isApi = pathname.startsWith("/api");

  // ✅ API pública
  if (isApi && isPublicApi(pathname)) {
    return NextResponse.next();
  }

  // ✅ página pública
  if (!isApi && isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // ❌ não logado
  if (!isLoggedIn) {
    if (isApi) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  // ❌ inativo
  if (isInactive) {
    if (isApi) {
      return NextResponse.json({ error: "INACTIVE_USER" }, { status: 403 });
    }

    const url = new URL("/login", nextUrl);
    url.searchParams.set("reason", "inactive");
    return NextResponse.redirect(url);
  }

  // ✅ autorização por permissão (rotas)
  const rule = matchRule(pathname);
  if (rule) {
    const ok = hasPermFromSession(user, rule.perm);
    if (!ok) {
      if (isApi) {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/nao-autorizado", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  // ✅ Protege TUDO (inclusive /api), exceto assets do Next
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};
