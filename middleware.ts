// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth"; // MESMO import que você usa no layout

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

// O middleware AGORA é o `auth` do v5 envolvendo a sua lógica
export default auth(async (req: NextRequest & { auth?: any }) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const session = req.auth; // <- sessão já resolvida pelo Auth v5
  const user = session?.user;

  const isLoggedIn = !!user;
  const isInactive = user && user.ativo === false;

  // Usuário logado ativo tentando ir pra /login -> manda pro /dashboard
  if (pathname === "/login" && isLoggedIn && !isInactive) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Usuário inativo: manda pra /login com reason=inactive (ajusta se quiser)
  if (isInactive && !pathname.startsWith("/login")) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("reason", "inactive");
    return NextResponse.redirect(url);
  }

  // Usuário NÃO logado tentando rota protegida -> /login com callbackUrl
  if (!isLoggedIn && !isPublicPath(pathname)) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Caso normal: segue o fluxo
  return NextResponse.next();
});

export const config = {
  matcher: ["/:path*"],
};
