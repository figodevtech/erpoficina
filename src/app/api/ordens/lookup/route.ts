export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireOSAccess } from "../../_authz/perms";

export async function GET() {
  try {
    await requireOSAccess();

    const { data: setores } = await supabaseAdmin
      .from("setor")
      .select("id, nome")
      .order("nome");

    const tiposOS = ["ORCAMENTO", "SERVICO", "GARANTIA"];
    const statusChecklist = ["PENDENTE", "OK", "ALERTA", "FALHA"];

    return NextResponse.json({
      setores: setores ?? [],
      tiposOS,
      statusChecklist,
    });
  } catch (e: any) {
    const status = e?.statusCode ?? (/não autenticado|unauth/i.test(e?.message) ? 401 : 500);
    return NextResponse.json({ error: e?.message ?? "Erro no lookup" }, { status });
  }
}
