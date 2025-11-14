import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string };
    const value = (email || "").trim().toLowerCase();
    if (!value) return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      (req.headers.get("origin") ?? "http://localhost:3000");

    const redirectTo = `${origin}/recuperar-senha`;

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(value, { redirectTo });
    if (error) {
      // o Supabase normalmente não revela existência do e-mail; tratamos como erro real apenas se retornar erro explícito
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro ao enviar recuperação" }, { status: 500 });
  }
}
