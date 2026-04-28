import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireExecucaoOSAccess } from "@/app/api/_authz/perms";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ExecucaoSession = {
  userId: string;
  setorId: number;
};

export async function getExecucaoSession(): Promise<ExecucaoSession | NextResponse> {
  const session = await auth();
  const user = session?.user as any;

  if (!user?.id) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    await requireExecucaoOSAccess();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const setorId = Number(user?.setorId);
  if (!Number.isFinite(setorId) || setorId <= 0) {
    return NextResponse.json(
      { error: "Usuario sem setor vinculado para execucao." },
      { status: 400 }
    );
  }

  return { userId: String(user.id), setorId };
}

export async function getOrdemDoSetor(osId: number, setorId: number) {
  return supabaseAdmin
    .from("ordemservico")
    .select("id, setorid, status, execucao_inicio_em, execucao_fim_em")
    .eq("id", osId)
    .eq("setorid", setorId)
    .maybeSingle();
}

export function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

export const STATUS_EXECUTAVEIS = ["ORCAMENTO_APROVADO", "EM_ANDAMENTO"] as const;
