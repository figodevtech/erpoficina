import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // precisa usar SERVICE_ROLE

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string };
    const value = (email || "").trim().toLowerCase();
    if (!value) return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });

    // Tenta o método novo (se a sua versão do supabase-js suportar)
    try {
      // @ts-expect-error: projetos mais antigos não têm getUserByEmail tipado
      const { data, error } = await supabaseAdmin.auth.admin.getUserByEmail(value);
      if (!error && data?.user) return NextResponse.json({ exists: true });
    } catch {
      // ignora e cai no fallback
    }

    // Fallback: pagina sobre os usuários e procura pelo e-mail (ok para bases pequenas/médias)
    let page = 1;
    const perPage = 200;
    // limite de 10 páginas para não travar se a base for enorme
    // ajuste conforme seu tamanho real
    for (; page <= 10; page++) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) break;
      const found = (data?.users || []).some((u: any) => (u.email || "").toLowerCase() === value);
      if (found) return NextResponse.json({ exists: true });
      if ((data?.users?.length || 0) < perPage) break; // acabou
    }

    return NextResponse.json({ exists: false });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro ao consultar e-mail" }, { status: 500 });
  }
}
