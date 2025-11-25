// app/api/users/reset-password/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { auth } from "@/lib/auth";

const OPEN = process.env.OPEN_PERMISSIONS === "true";

export async function POST(req: NextRequest) {
  try {
    if (!OPEN) {
      const session = await auth();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json(
        { error: "E-mail é obrigatório." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email);
    if (error) throw error;

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error("POST /api/users/reset-password", e);
    return NextResponse.json(
      {
        error:
          e?.message ??
          "Erro ao enviar e-mail de redefinição de senha / convite.",
      },
      { status: 500 }
    );
  }
}
