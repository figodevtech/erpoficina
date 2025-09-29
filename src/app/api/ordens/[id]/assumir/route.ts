import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { auth } from "@/lib/auth";

// Tipagem compatível com Next 15 (params é Promise)
type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: RouteCtx) {
  try {
    const session = await auth();
    const user = session?.user as any;
    const userId: string | undefined = user?.id;
    const userSetorId: number | null | undefined = user?.setorId ?? user?.setorid ?? null;

    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const osId = Number(id);
    if (!Number.isFinite(osId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Carrega OS para validar setor do usuário
    const { data: os, error: eOs } = await supabaseAdmin
      .from("ordemservico")
      .select("id, setorid, status")
      .eq("id", osId)
      .maybeSingle();

    if (eOs) throw eOs;
    if (!os) return NextResponse.json({ error: "OS não encontrada" }, { status: 404 });

    if (!userSetorId || os.setorid !== userSetorId) {
      return NextResponse.json(
        { error: "Usuário sem permissão para assumir esta OS (setor diferente)" },
        { status: 403 },
      );
    }

    // Atualiza para EM_ANDAMENTO (se já estiver, mantém)
    const novoStatus = "EM_ANDAMENTO";
    const { error: eUp } = await supabaseAdmin
      .from("ordemservico")
      .update({ status: novoStatus, updatedat: new Date().toISOString() })
      .eq("id", osId);

    if (eUp) throw eUp;

    return NextResponse.json({ id: osId, status: novoStatus }, { status: 200 });
  } catch (err: any) {
    console.error("[POST] /api/ordens/[id]/assumir", err);
    return NextResponse.json({ error: "Falha ao assumir OS" }, { status: 500 });
  }
}
