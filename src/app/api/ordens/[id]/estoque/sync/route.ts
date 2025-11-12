import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { id: string };

export async function POST(_req: Request, { params }: { params: Params }) {
  const osId = Number(params.id);
  if (!Number.isFinite(osId)) {
    return NextResponse.json({ error: "OS inválida" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.rpc("reaplicar_baixa_estoque_os", { p_os_id: osId });
  if (error) {
    return NextResponse.json({ error: error.message || "Falha ao sincronizar estoque" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
