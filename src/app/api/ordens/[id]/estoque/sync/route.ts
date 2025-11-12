// src/app/api/ordens/[id]/estoque/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { id: string };

export async function POST(
  _req: NextRequest,
  context: { params: Promise<Params> } // Next 15: params é Promise
) {
  try {
    const { id } = await context.params;

    const osId = Number(id);
    if (!Number.isFinite(osId)) {
      return NextResponse.json({ error: "OS inválida" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.rpc("reaplicar_baixa_estoque_os", { p_os_id: osId });
    if (error) {
      return NextResponse.json(
        { error: error.message || "Falha ao sincronizar estoque" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[POST] /api/ordens/[id]/estoque/sync", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro inesperado ao sincronizar estoque" },
      { status: 500 }
    );
  }
}
