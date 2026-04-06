// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { PERMS, type Permission } from "@/app/api/_authz/perms";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
// REMOVED GLOBAL CLIENT TO AVOID STATE LEAKAGE

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

  "/api/ordens/aprovacao",
  "/api/nfse/test-jp",
  "/api/webhooks/focus",
];

function isStaticAsset(pathname: string) {
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images")
  ) {
    return true;
  }
  return /\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map|json|webmanifest)$/.test(
    pathname,
  );
}

function isPublicPath(pathname: string) {
  if (isStaticAsset(pathname)) return true;
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

function isPublicApi(pathname: string) {
  if (!pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/api/auth")) return true; // NextAuth sempre público
  return PUBLIC_API_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
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

  { prefix: "/veiculos", perm: PERMS.VEICULOS },
];

function matchRule(pathname: string) {
  return ROUTE_PERMS.find(
    (r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/"),
  );
}

function hasPermFromSession(user: any, perm: string) {
  const perms: string[] = Array.isArray(user?.permissoes)
    ? user.permissoes
    : [];
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

  // Variáveis locais para decisão (evita mutar o objeto user da sessão original se possível)
  let isInactive = false;
  let isRoot = false;

  // Se tiver usuário, pega o ID e consulta dados frescos
  const userId = (user as any)?.id as string | undefined;

  // Inicializa com o que veio do token (fallback)
  if (isLoggedIn) {
    isInactive = (user as any).ativo === false;
    isRoot = (user as any).is_root === true;
  }

  // CRIAÇÃO DO CLIENTE SUPABASE ISOLADA NO HANDLER (evita leak de estado no Edge)
  const supabaseAdminEdge =
    supabaseUrl && serviceKey
      ? createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (url, options) => {
              return fetch(url, { ...options, cache: "no-store" });
            },
          },
        })
      : null;

  if (userId && supabaseAdminEdge) {
    try {
      // Força busca sem cache (garantido pelo client configurado acima com no-store)
      const { data, error } = await supabaseAdminEdge
        .from("usuario")
        .select("ativo, is_root")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("[Middleware] Erro ao buscar usuario:", error.message);
      }

      if (data) {
        // Atualiza as variáveis locais com a verdade do banco
        isInactive = data.ativo === false;
        isRoot = data.is_root === true;

        // Log de debug para produção
        console.log(
          `[Middleware] User: ${userId} | DB_IsRoot: ${data.is_root} | Token_IsRoot: ${(user as any).is_root}`,
        );
      }
    } catch (err) {
      console.error("[Middleware] Falha geral user check:", err);
    }
  }

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

  // ✅ Lógica de Usuário ROOT
  if (isRoot) {
    // Se for API, deixa passar (para não quebrar fetches do front)
    if (isApi) {
      return NextResponse.next({ headers: { "Cache-Control": "no-store" } });
    }

    if (!pathname.startsWith("/root")) {
      // Se tentar acessar qualquer coisa fora do /root (ex: /dashboard, /clientes), joga para /root
      return NextResponse.redirect(new URL("/root", nextUrl), {
        headers: { "Cache-Control": "no-store" },
      });
    }
    // Se for /root, deixa passar (ainda vai cair no return next() lá embaixo)
    return NextResponse.next({ headers: { "Cache-Control": "no-store" } });
  } else {
    // ❌ Não é root
    if (pathname.startsWith("/root")) {
      // Se tentar acessar /root sendo comum, joga para /dashboard
      return NextResponse.redirect(new URL("/dashboard", nextUrl), {
        headers: { "Cache-Control": "no-store" },
      });
    }
  }

  // ✅ autorização por permissão (rotas)
  const rule = matchRule(pathname);
  if (rule) {
    const ok = hasPermFromSession(user, rule.perm);
    if (!ok) {
      if (isApi) {
        return NextResponse.json(
          { error: "FORBIDDEN" },
          { status: 403, headers: { "Cache-Control": "no-store" } },
        );
      }
      return NextResponse.redirect(new URL("/nao-autorizado", nextUrl), {
        headers: { "Cache-Control": "no-store" },
      });
    }
  }

  return NextResponse.next({ headers: { "Cache-Control": "no-store" } });
});

export const config = {
  // ✅ Protege TUDO (inclusive /api), exceto assets do Next
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};
