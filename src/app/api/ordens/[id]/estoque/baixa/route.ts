// src/app/api/ordens/[id]/estoque/baixa/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { id: string };

export async function POST(_req: Request, { params }: { params: Params }) {
  const osId = Number(params.id);
  if (!Number.isFinite(osId)) {
    return NextResponse.json({ error: "OS inválida" }, { status: 400 });
  }

  // Se quiser auditar quem executou a baixa, leia do body:
  // const { usuarioId }: { usuarioId?: string } = await _req.json().catch(() => ({}));

  // *** Abordagem A (recomendada): usa função SQL transacional (abaixo) ***
  const { error } = await supabaseAdmin.rpc("consumir_estoque_os", {
    p_os_id: osId,
    // p_usuario: usuarioId ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message ?? "Falha ao dar baixa no estoque" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
