// src/app/api/ordens/[id]/estoque/baixa/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { id: string };

export async function POST(
  req: NextRequest,
  context: { params: Promise<Params> } // Next 15: params é Promise
) {
  try {
    const { id } = await context.params;

    const osId = Number(id);
    if (!Number.isFinite(osId)) {
      return NextResponse.json({ error: "OS inválida" }, { status: 400 });
    }

    // Se quiser auditar quem executou a baixa, leia do body (opcional):
    // const { usuarioId }: { usuarioId?: string } = await req.json().catch(() => ({}));

    // Chamada transacional via função SQL
    const { error } = await supabaseAdmin.rpc("consumir_estoque_os", {
      p_os_id: osId,
      // p_usuario: usuarioId ?? null,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "Falha ao dar baixa no estoque" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[POST] /api/ordens/[id]/estoque/baixa", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro inesperado ao dar baixa" },
      { status: 500 }
    );
  }
}
