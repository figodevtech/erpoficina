// src/middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  const session = await auth();

  const isLoggedIn = !!session;

  // Se não estiver logado e tentar acessar qualquer rota dentro de (app) → manda pro /login
  if (
    (!isLoggedIn && url.pathname.startsWith("/dashboard")) ||
    url.pathname.startsWith("/usuarios") ||
    url.pathname.startsWith("/(app)")
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Se já estiver logado e tentar ir pra /login → manda pro dashboard (ou "/")
  if (isLoggedIn && url.pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Protege apenas as rotas dentro de (app), e ignora API/arquivos estáticos
export const config = {
  matcher: ["/", "/(app)/(.*)"], // protege a raiz e tudo dentro de (app)
};
