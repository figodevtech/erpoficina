// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Rotas realmente públicas (login, recovery e APIs públicas)
const PUBLIC_PATHS = [
  "/login",
  "/recuperar-senha",
  "/api/auth",
  "/api/auth/check-email",
  "/api/auth/send-recovery",
];

function isStaticAsset(pathname: string) {
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images")
  ) {
    return true;
  }

  if (/\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map)$/.test(pathname)) {
    return true;
  }

  return false;
}

function isPublicPath(pathname: string) {
  if (isStaticAsset(pathname)) return true;

  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // 🔐 Lê o token da sessão
  const token = await getToken({ req });
  const isLoggedIn = !!token;

  // 1) Usuário logado indo para /login -> manda para /dashboard
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 2) Bloqueia tudo que não é público quando não está logado
  if (!isLoggedIn && !isPublicPath(pathname)) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  // 3) Segue normal
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
