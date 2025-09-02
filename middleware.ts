import { auth as middleware } from "@/lib/auth";
import { NextResponse } from "next/server";

export default middleware((req) => {
  const isAuthenticated = !!req.auth;
  const protectedPaths = ["/dashboard", "/os", "/estoque", "/financeiro", "/clientes", "/usuarios"];

  if (!isAuthenticated && protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/os/:path*",
    "/estoque/:path*",
    "/financeiro/:path*",
    "/clientes/:path*",
    "/usuarios/:path*",
  ],
};
