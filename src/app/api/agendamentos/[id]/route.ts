export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAgendamentosDelete, requireAgendamentosEdit } from "@/app/api/_authz/perms";
import type { StatusAgendamento } from "@/types/agendamento";

type RouteContext = { params: Promise<{ id: string }> };

const STATUS = new Set<StatusAgendamento>([
  "AGENDADO",
  "CONFIRMADO",
  "EM_ATENDIMENTO",
  "CONCLUIDO",
  "CANCELADO",
]);

const SELECT = `
  id,
  clienteid,
  veiculoid,
  usuarioid,
  titulo,
  descricao,
  inicio,
  fim,
  status,
  createdat,
  updatedat,
  cliente:clienteid ( id, nomerazaosocial, telefone, email ),
  veiculo:veiculoid ( id, placa, modelo, marca ),
  usuario:usuarioid ( id, nome )
`;

function nullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseOptionalDate(value: unknown, field: string) {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    const error = new Error(`${field} invalido`);
    (error as any).statusCode = 400;
    throw error;
  }
  return date.toISOString();
}

async function buildPatch(body: any, currentId: number, usuarioid?: string | null) {
  const patch: Record<string, any> = {};

  if ("clienteid" in body) {
    const clienteid = nullableNumber(body.clienteid);
    if (!clienteid) {
      const error = new Error("clienteid e obrigatorio");
      (error as any).statusCode = 400;
      throw error;
    }
    patch.clienteid = clienteid;
  }

  if ("veiculoid" in body) patch.veiculoid = nullableNumber(body.veiculoid);
  if ("usuarioid" in body) patch.usuarioid = body.usuarioid || usuarioid || null;

  if ("titulo" in body) {
    const titulo = String(body.titulo ?? "").trim();
    if (!titulo) {
      const error = new Error("titulo e obrigatorio");
      (error as any).statusCode = 400;
      throw error;
    }
    patch.titulo = titulo;
  }

  if ("descricao" in body) patch.descricao = body.descricao ? String(body.descricao).trim() : null;
  if ("inicio" in body) patch.inicio = parseOptionalDate(body.inicio, "inicio");
  if ("fim" in body) patch.fim = parseOptionalDate(body.fim, "fim");
  if ("status" in body) {
    const status = String(body.status ?? "").toUpperCase() as StatusAgendamento;
    if (!STATUS.has(status)) {
      const error = new Error("status invalido");
      (error as any).statusCode = 400;
      throw error;
    }
    patch.status = status;
  }

  if ("inicio" in patch && !patch.inicio) {
    const error = new Error("inicio e obrigatorio");
    (error as any).statusCode = 400;
    throw error;
  }

  if (patch.inicio && new Date(patch.inicio).getTime() < Date.now()) {
    const error = new Error("Nao e possivel agendar em data anterior");
    (error as any).statusCode = 400;
    throw error;
  }

  if (patch.inicio) {
    const { data: existente, error: existenteError } = await supabaseAdmin
      .from("agendamento")
      .select("id")
      .eq("inicio", patch.inicio)
      .neq("id", currentId)
      .maybeSingle();

    if (existenteError) throw existenteError;
    if (existente) {
      const error = new Error("Ja existe agendamento para este horario");
      (error as any).statusCode = 409;
      throw error;
    }
  }

  if (patch.inicio && patch.fim && new Date(patch.fim).getTime() <= new Date(patch.inicio).getTime()) {
    const error = new Error("fim deve ser maior que inicio");
    (error as any).statusCode = 400;
    throw error;
  }

  return patch;
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    await requireAgendamentosEdit();
    const { id } = await context.params;
    const agendamentoId = Number(id);
    const session = await auth();
    const patch = await buildPatch(await req.json(), agendamentoId, (session?.user as any)?.id ?? null);

    const { data, error } = await supabaseAdmin
      .from("agendamento")
      .update(patch)
      .eq("id", agendamentoId)
      .select(SELECT)
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (e: any) {
    const status = e?.statusCode ?? (/autenticado|permiss/i.test(e?.message) ? 403 : 500);
    return NextResponse.json({ error: e?.message ?? "Erro ao atualizar agendamento" }, { status });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    await requireAgendamentosDelete();
    const { id } = await context.params;

    const { error } = await supabaseAdmin.from("agendamento").delete().eq("id", Number(id));
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const status = e?.statusCode ?? (/autenticado|permiss/i.test(e?.message) ? 403 : 500);
    return NextResponse.json({ error: e?.message ?? "Erro ao excluir agendamento" }, { status });
  }
}
