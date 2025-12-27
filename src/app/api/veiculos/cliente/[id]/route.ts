import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export const revalidate = 0;

function respostaJSON(body: any, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function normalizarPlaca(valor: string) {
  return valor.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function parseIntSeguro(valor: string | null) {
  if (!valor) return null;
  const n = Number(valor);
  return Number.isInteger(n) ? n : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const clienteId = parseIntSeguro(searchParams.get("clienteId"));
    const placa = (searchParams.get("placa") || "").trim();
    const q = (searchParams.get("q") || "").trim();
    const tipo = (searchParams.get("tipo") || "").trim();

    const limitRaw = parseIntSeguro(searchParams.get("limit"));
    const offsetRaw = parseIntSeguro(searchParams.get("offset"));
    const limit = Math.min(Math.max(limitRaw ?? 50, 1), 200);
    const offset = Math.max(offsetRaw ?? 0, 0);

    let query = supabase
      .from("veiculo")
      .select("id, clienteid, placa, placa_formatada, modelo, marca, ano, cor, kmatual, tipo", {
        count: "exact",
      })
      .order("modelo", { ascending: true })
      .range(offset, offset + limit - 1);

    if (clienteId !== null) query = query.eq("clienteid", clienteId);

    if (placa) query = query.eq("placa", normalizarPlaca(placa));
    if (tipo) query = query.eq("tipo", tipo);

    if (q) {
      const termo = `%${q}%`;
      query = query.or(`modelo.ilike.${termo},marca.ilike.${termo}`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return respostaJSON({ veiculos: data ?? [], total: count ?? 0, limit, offset });
  } catch (err: any) {
    console.error("GET /api/veiculos", err);
    return respostaJSON({ error: "Falha ao listar veículos" }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return respostaJSON({ error: "JSON inválido no body." }, 400);

    const clienteId = Number(body.clienteId);
    const placa = typeof body.placa === "string" ? normalizarPlaca(body.placa) : "";
    const modelo = typeof body.modelo === "string" ? body.modelo.trim() : "";
    const marca = typeof body.marca === "string" ? body.marca.trim() : "";

    const ano = body.ano === null || body.ano === undefined ? null : Number(body.ano);
    const kmatual = body.kmatual === null || body.kmatual === undefined ? null : Number(body.kmatual);
    const cor = body.cor === null || body.cor === undefined ? null : String(body.cor).trim();
    const tipo = body.tipo ? String(body.tipo).trim() : undefined;

    if (!Number.isInteger(clienteId) || clienteId <= 0) {
      return respostaJSON({ error: "Campo 'clienteId' é obrigatório e deve ser inteiro > 0." }, 400);
    }
    if (!placa) return respostaJSON({ error: "Campo 'placa' é obrigatório." }, 400);
    if (!modelo) return respostaJSON({ error: "Campo 'modelo' é obrigatório." }, 400);
    if (!marca) return respostaJSON({ error: "Campo 'marca' é obrigatório." }, 400);

    if (ano !== null && (!Number.isInteger(ano) || ano < 1900 || ano > 3000)) {
      return respostaJSON({ error: "Campo 'ano' inválido." }, 400);
    }
    if (kmatual !== null && (!Number.isInteger(kmatual) || kmatual < 0)) {
      return respostaJSON({ error: "Campo 'kmatual' inválido." }, 400);
    }

    const payload: any = { clienteid: clienteId, placa, modelo, marca, ano, cor, kmatual };
    if (tipo) payload.tipo = tipo;

    const { data, error } = await supabase
      .from("veiculo")
      .insert(payload)
      .select("id, clienteid, placa, placa_formatada, modelo, marca, ano, cor, kmatual, tipo")
      .single();

    if (error) throw error;

    return respostaJSON({ veiculo: data }, 201);
  } catch (err: any) {
    console.error("POST /api/veiculos", err);
    return respostaJSON({ error: "Falha ao criar veículo" }, 500);
  }
}
