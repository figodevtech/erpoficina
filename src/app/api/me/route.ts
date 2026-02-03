export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("usuario")
    .select("ativo")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message || "Falha ao validar usuário" }, { status: 500 });
  }

  if (!data || data.ativo === false) {
    return NextResponse.json({ error: "INACTIVE_USER" }, { status: 403 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

