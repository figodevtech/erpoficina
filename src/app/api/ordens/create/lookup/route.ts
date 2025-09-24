// app/api/os/create/lookup/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data: setores } = await supabaseAdmin
      .from("setor")
      .select("id, nome")
      .order("nome");

    // enums que usaremos
    const tiposOS = ["ORCAMENTO", "SERVICO", "GARANTIA"];
    const statusChecklist = ["PENDENTE", "OK", "FALHA"];

    return NextResponse.json({
      setores: setores ?? [],
      tiposOS,
      statusChecklist,
    });
  } catch (e: any) {
    const msg = e?.message ?? "Erro no lookup";
    const status = /não autenticado|unauth/i.test(msg) ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
