export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireOSAccess } from "../../../_authz/perms";

type Params = { id: string };

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await requireOSAccess();

    const { id } = await params; // 👈 agora precisa de await
    const osId = Number(id);

    const { status: novoStatus } = await req.json();

    const { data: os } = await supabaseAdmin
      .from("ordemservico")
      .select("id, status")
      .eq("id", osId)
      .maybeSingle();

    if (!os) {
      return NextResponse.json({ error: "OS não encontrada" }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("ordemservico")
      .update({ status: novoStatus })
      .eq("id", osId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const status =
      e?.statusCode ?? (/não autenticado|unauth/i.test(e?.message) ? 401 : 500);
    return NextResponse.json(
      { error: e?.message ?? "Erro ao alterar status" },
      { status }
    );
  }
}
