// app/api/debug/env/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function GET() {
  const raw = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim().replace(/^"|"$/g, "");
  let role: string | null = null;

  try {
    const [, payload] = raw.split(".");
    if (payload) {
      const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
      role = JSON.parse(json)?.role ?? null;
    }
  } catch {}

  return NextResponse.json({
    OPEN_PERMISSIONS: (process.env.OPEN_PERMISSIONS ?? "").toString(),
    URL_SET: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    ANON_SET: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SERVICE_SET: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    SERVICE_PREFIX: raw ? raw.slice(0, 3) : null, // deve ser "eyJ"
    SERVICE_JWT_ROLE: role,                        // deve ser "service_role"
  });
}
