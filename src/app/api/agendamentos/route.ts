export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAgendamentosAccess, requireAgendamentosCreate } from "@/app/api/_authz/perms";
import type { StatusAgendamento } from "@/types/agendamento";
import { AGENDAMENTO_STATUS_SET, asStatusAgendamento, formatAgendamentoMessage } from "@/lib/agendamentos";
import { buildAppointmentEmailHtml, sendEmail } from "@/lib/email";

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
  origem,
  motivorecusa,
  mensagemnotificacao,
  canalnotificacao,
  notificadoat,
  decisaoat,
  decisorusuarioid,
  createdat,
  updatedat,
  cliente:clienteid ( id, nomerazaosocial, telefone, email ),
  veiculo:veiculoid ( id, placa, modelo, marca ),
  usuario:usuarioid ( id, nome )
`;

function asStatus(value: unknown): StatusAgendamento {
  return asStatusAgendamento(value, "AGENDADO");
}

function nullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function requiredString(value: unknown, field: string) {
  const text = String(value ?? "").trim();
  if (!text) {
    const error = new Error(`${field} e obrigatorio`);
    (error as any).statusCode = 400;
    throw error;
  }
  return text;
}

function parseDate(value: unknown, field: string) {
  const text = requiredString(value, field);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    const error = new Error(`${field} invalido`);
    (error as any).statusCode = 400;
    throw error;
  }
  return date.toISOString();
}

async function buildPayload(body: any, usuarioid?: string | null) {
  const clienteid = nullableNumber(body?.clienteid);
  if (!clienteid) {
    const error = new Error("clienteid e obrigatorio");
    (error as any).statusCode = 400;
    throw error;
  }

  const inicio = parseDate(body?.inicio, "inicio");
  if (new Date(inicio).getTime() < Date.now()) {
    const error = new Error("Nao e possivel agendar em data anterior");
    (error as any).statusCode = 400;
    throw error;
  }

  const { data: existente, error: existenteError } = await supabaseAdmin
    .from("agendamento")
    .select("id")
    .eq("inicio", inicio)
    .not("status", "in", "(RECUSADO,CANCELADO)")
    .maybeSingle();

  if (existenteError) throw existenteError;
  if (existente) {
    const error = new Error("Ja existe agendamento para este horario");
    (error as any).statusCode = 409;
    throw error;
  }

  const fim = body?.fim ? parseDate(body.fim, "fim") : null;
  if (fim && new Date(fim).getTime() <= new Date(inicio).getTime()) {
    const error = new Error("fim deve ser maior que inicio");
    (error as any).statusCode = 400;
    throw error;
  }

  return {
    clienteid,
    veiculoid: nullableNumber(body?.veiculoid),
    usuarioid: body?.usuarioid || usuarioid || null,
    titulo: requiredString(body?.titulo, "titulo"),
    descricao: body?.descricao ? String(body.descricao).trim() : null,
    inicio,
    fim,
    status: asStatus(body?.status),
    origem: body?.origem === "SITE" ? "SITE" : "ERP",
  };
}

export async function GET(req: Request) {
  try {
    await requireAgendamentosAccess();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status")?.trim().toUpperCase();
    const q = searchParams.get("q")?.trim();
    const dateFrom = searchParams.get("dateFrom")?.trim();
    const dateTo = searchParams.get("dateTo")?.trim();
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 20), 1), 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("agendamento")
      .select(SELECT, { count: "exact" })
      .order("inicio", { ascending: true })
      .range(from, to);

    if (status && status !== "TODOS" && AGENDAMENTO_STATUS_SET.has(status as StatusAgendamento)) {
      query = query.eq("status", status);
    }

    if (dateFrom) query = query.gte("inicio", `${dateFrom}T00:00:00.000Z`);
    if (dateTo) query = query.lte("inicio", `${dateTo}T23:59:59.999Z`);

    if (q) {
      const like = `%${q}%`;
      const { data: clientes, error: clientesError } = await supabaseAdmin
        .from("cliente")
        .select("id")
        .or(`nomerazaosocial.ilike.${like},cpfcnpj.ilike.${like},telefone.ilike.${like}`)
        .limit(100);

      if (clientesError) throw clientesError;

      const clienteIds = (clientes ?? []).map((cliente) => cliente.id).filter(Boolean);
      const filters = [`titulo.ilike.${like}`, `descricao.ilike.${like}`];
      if (clienteIds.length) filters.push(`clienteid.in.(${clienteIds.join(",")})`);
      query = query.or(filters.join(","));
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count ?? 0;
    return NextResponse.json({
      items: data ?? [],
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (e: any) {
    const status = e?.statusCode ?? (/autenticado|permiss/i.test(e?.message) ? 403 : 500);
    return NextResponse.json({ error: e?.message ?? "Erro ao listar agendamentos" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    await requireAgendamentosCreate();
    const session = await auth();
    const payload = await buildPayload(await req.json(), (session?.user as any)?.id ?? null);

    const { data, error } = await supabaseAdmin
      .from("agendamento")
      .insert(payload)
      .select(SELECT)
      .single();

    if (error) throw error;

    const cliente = Array.isArray(data.cliente) ? data.cliente[0] : data.cliente;
    let emailResult = null;

    if (data.status === "AGENDADO") {
      const message = formatAgendamentoMessage({
        status: "APROVADO",
        clienteNome: cliente?.nomerazaosocial,
        inicio: data.inicio,
      });

      emailResult = await sendEmail({
        to: cliente?.email,
        subject: "Agendamento confirmado",
        text: message,
        html: buildAppointmentEmailHtml({
          title: "Agendamento confirmado",
          statusLabel: "Confirmado",
          statusTone: "approved",
          customerName: cliente?.nomerazaosocial,
          appointmentDate: data.inicio,
          summary: data.descricao,
          footerNote: "Aguardamos voce na Alpha Garage PB no horario agendado.",
        }),
      });

      if (emailResult.sent) {
        await supabaseAdmin
          .from("agendamento")
          .update({
            mensagemnotificacao: message,
            canalnotificacao: "EMAIL",
            notificadoat: new Date().toISOString(),
          })
          .eq("id", data.id);
      }
    }

    return NextResponse.json({ data, emailResult }, { status: 201 });
  } catch (e: any) {
    const status = e?.statusCode ?? (/autenticado|permiss/i.test(e?.message) ? 403 : 500);
    return NextResponse.json({ error: e?.message ?? "Erro ao criar agendamento" }, { status });
  }
}
