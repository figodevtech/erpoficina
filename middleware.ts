// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

  const token = await getToken({ req });

  let isLoggedIn = false;
  let reason: "inactive" | null = null;

  if (token?.sub) {
    const { data: row, error } = await supabaseAdmin
      .from("usuario")
      .select("ativo")
      .eq("id", token.sub as string)
      .maybeSingle();

    if (!error && row && row.ativo === true) {
      isLoggedIn = true;
    } else if (!error && row && row.ativo === false) {
      isLoggedIn = false;
      reason = "inactive";
    }
  }

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (!isLoggedIn && !isPublicPath(pathname)) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", pathname + nextUrl.search);
    if (reason === "inactive") {
      url.searchParams.set("reason", "inactive");
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/:path*"],
};
