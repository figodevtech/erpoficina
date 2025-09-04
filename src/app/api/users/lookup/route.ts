// app/api/users/lookup/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureAccess } from "../_authz";

export async function GET() {
  const isOpen = process.env.OPEN_PERMISSIONS === "true";
  try {
    const session = isOpen ? null : await auth();
    await ensureAccess(session);

    const [
      { data: setores, error: sErr },
      { data: permissoes, error: pErr },
      { data: perfis, error: pfErr },
    ] = await Promise.all([
      supabaseAdmin.from("setor").select("id, nome").order("nome"),
      supabaseAdmin.from("permissao").select("id, nome, descricao").order("nome"),
      supabaseAdmin.from("perfil").select("id, nome").order("nome"),
    ]);

    if (sErr) throw sErr;
    if (pErr) throw pErr;
    if (pfErr) throw pfErr;

    return NextResponse.json({ setores, permissoes, perfis });
  } catch (e: any) {
    console.error("[/api/users/lookup] error:", e);
    return NextResponse.json({ error: e.message ?? "Erro ao carregar listas auxiliares" }, { status: 401 });
  }
}
