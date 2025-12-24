import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string };
    const value = (email || "").trim().toLowerCase();
    if (!value)
      return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });

    // ✅ SEM redirectTo → Supabase usa dashboard config
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(value);

    // Sempre sucesso (melhor UX)
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Erro ao enviar recuperação" },
      { status: 500 }
    );
  }
}
