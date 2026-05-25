export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { onlyDigits } from "@/lib/agendamentos";

const PUBLIC_SELECT = `
  id,
  inicio,
  fim,
  status
`;

function requiredString(value: unknown, field: string) {
  const text = String(value ?? "").trim();
  if (!text) {
    const error = new Error(`${field} e obrigatorio`);
    (error as any).statusCode = 400;
    throw error;
  }
  return text;
}

function optionalString(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

function parseDate(value: unknown, field: string) {
  const date = new Date(requiredString(value, field));
  if (Number.isNaN(date.getTime())) {
    const error = new Error(`${field} invalido`);
    (error as any).statusCode = 400;
    throw error;
  }
  return date.toISOString();
}

function validEmail(value?: string | null) {
  if (!value) return true;
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);
}

function validPlaca(value?: string | null) {
  if (!value) return false;
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(value);
}

async function getOrCreateCliente(body: any) {
  const cpfcnpj = onlyDigits(requiredString(body?.cpfcnpj, "cpfcnpj"));
  const telefone = optionalString(body?.telefone);
  const email = optionalString(body?.email);
  const nome = requiredString(body?.nome, "nome");

  if (!cpfcnpj) {
    const error = new Error("cpfcnpj invalido");
    (error as any).statusCode = 400;
    throw error;
  }

  if (!telefone) {
    const error = new Error("telefone e obrigatorio");
    (error as any).statusCode = 400;
    throw error;
  }

  if (!validEmail(email)) {
    const error = new Error("email invalido");
    (error as any).statusCode = 400;
    throw error;
  }

  const matchFilters = [`cpfcnpj.eq.${cpfcnpj}`, `telefone.eq.${telefone}`];
  if (email) matchFilters.push(`email.eq.${email}`);

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("cliente")
    .select("id, nomerazaosocial, telefone, email")
    .or(matchFilters.join(","))
    .limit(1);

  if (existingError) throw existingError;
  if (existing?.[0]) return existing[0];

  const payload = {
    tipopessoa: cpfcnpj.length > 11 ? "JURIDICA" : "FISICA",
    cpfcnpj,
    nomerazaosocial: nome,
    telefone,
    email,
    cidade: optionalString(body?.cidade) ?? "Nao informado",
    estado: (optionalString(body?.estado) ?? "PB").slice(0, 2).toUpperCase(),
    endereco: optionalString(body?.endereco),
    bairro: optionalString(body?.bairro),
    cep: onlyDigits(optionalString(body?.cep)) || null,
    status: "PENDENTE",
  };

  const { data, error } = await supabaseAdmin
    .from("cliente")
    .insert(payload)
    .select("id, nomerazaosocial, telefone, email")
    .single();

  if (error) {
    if ((error as any).code === "23505") {
      const { data: fallback, error: fallbackError } = await supabaseAdmin
        .from("cliente")
        .select("id, nomerazaosocial, telefone, email")
        .or(`cpfcnpj.eq.${cpfcnpj},telefone.eq.${telefone},nomerazaosocial.eq.${nome}`)
        .limit(1);

      if (fallbackError) throw fallbackError;
      if (fallback?.[0]) return fallback[0];
    }

    throw error;
  }
  return data;
}

async function getOrCreateVeiculo(clienteid: number, body: any) {
  const placa = optionalString(body?.placa)?.toUpperCase().replace(/[^A-Z0-9]/g, "") ?? null;
  if (!placa) return null;

  if (!validPlaca(placa)) {
    const error = new Error("placa invalida");
    (error as any).statusCode = 400;
    throw error;
  }

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("veiculo")
    .select("id")
    .or(`placa.eq.${placa},placa_formatada.eq.${placa}`)
    .limit(1);

  if (existingError) throw existingError;
  if (existing?.[0]) return existing[0].id;

  const { data, error } = await supabaseAdmin
    .from("veiculo")
    .insert({
      clienteid,
      placa,
      marca: optionalString(body?.marca) ?? "Nao informado",
      modelo: optionalString(body?.modelo) ?? "Nao informado",
    })
    .select("id")
    .single();

  if (error) {
    if ((error as any).code === "23505") {
      const { data: fallback, error: fallbackError } = await supabaseAdmin
        .from("veiculo")
        .select("id")
        .or(`placa.eq.${placa},placa_formatada.eq.${placa}`)
        .limit(1);

      if (fallbackError) throw fallbackError;
      if (fallback?.[0]) return fallback[0].id;
    }

    throw error;
  }
  return data.id as number;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom")?.trim();
    const dateTo = searchParams.get("dateTo")?.trim();

    const configRes = await supabaseAdmin
      .from("config_geral")
      .select("agendamento_intervalo_minutos, agendamento_hora_inicio, agendamento_hora_fim, agendamento_dias_trabalho")
      .limit(1)
      .maybeSingle();

    if (configRes.error) throw configRes.error;

    let query = supabaseAdmin
      .from("agendamento")
      .select(PUBLIC_SELECT)
      .not("status", "in", "(RECUSADO,CANCELADO)")
      .order("inicio", { ascending: true })
      .limit(500);

    if (dateFrom) query = query.gte("inicio", `${dateFrom}T00:00:00.000Z`);
    if (dateTo) query = query.lte("inicio", `${dateTo}T23:59:59.999Z`);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      config: {
        agendamento_intervalo_minutos: Number(configRes.data?.agendamento_intervalo_minutos ?? 60),
        agendamento_hora_inicio: String(configRes.data?.agendamento_hora_inicio ?? "08:00").slice(0, 5),
        agendamento_hora_fim: String(configRes.data?.agendamento_hora_fim ?? "18:00").slice(0, 5),
        agendamento_dias_trabalho: configRes.data?.agendamento_dias_trabalho ?? [1, 2, 3, 4, 5],
      },
      ocupados: data ?? [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Erro ao consultar agenda" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cliente = await getOrCreateCliente(body?.cliente ?? body);
    const veiculoid = await getOrCreateVeiculo(cliente.id, body?.veiculo ?? body);
    const inicio = parseDate(body?.inicio, "inicio");

    if (new Date(inicio).getTime() < Date.now()) {
      const error = new Error("Nao e possivel solicitar agendamento em data anterior");
      (error as any).statusCode = 400;
      throw error;
    }

    const fim = body?.fim ? parseDate(body.fim, "fim") : null;
    if (fim && new Date(fim).getTime() <= new Date(inicio).getTime()) {
      const error = new Error("fim deve ser maior que inicio");
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
      const error = new Error("Horario indisponivel");
      (error as any).statusCode = 409;
      throw error;
    }

    const { data, error } = await supabaseAdmin
      .from("agendamento")
      .insert({
        clienteid: cliente.id,
        veiculoid,
        titulo: optionalString(body?.titulo) ?? "Solicitacao pelo site",
        descricao: optionalString(body?.descricao),
        inicio,
        fim,
        status: "PENDENTE_APROVACAO",
        origem: "SITE",
      })
      .select("id, status, origem, inicio, fim")
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        data,
        message: "Solicitacao recebida. A oficina vai analisar e retornar a confirmacao.",
      },
      { status: 201 },
    );
  } catch (e: any) {
    const status = e?.statusCode ?? 500;
    return NextResponse.json({ error: e?.message ?? "Erro ao solicitar agendamento" }, { status });
  }
}
