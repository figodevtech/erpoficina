// /src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// liste aqui TODAS as rotas públicas (e prefixos)
const PUBLIC_PATHS = [
  "/login",
  "/recuperar-senha",
  "/api/auth/check-email",
  "/api/auth/send-recovery",
  "/api/auth/session",         // usado pelo next-auth no client
];

function isPublic(pathname: string) {
  // arquivos públicos / build / imagens
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/public") ||
    pathname === "/favicon.ico"
  ) return true;

  // qualquer rota na lista acima (prefixo conta)
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // liberar rotas públicas
  if (isPublic(pathname)) return NextResponse.next();

  // exigir sessão para todo o resto
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// roda para tudo que não seja arquivo estático
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)).*)",
  ],
};
