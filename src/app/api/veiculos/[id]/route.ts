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

function idValido(raw: string) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

type Params = { id: string };

export async function GET(_request: Request, ctx: { params: Params }) {
  try {
    const id = idValido((ctx.params?.id || "").trim());
    if (!id) return respostaJSON({ error: "Parâmetro 'id' inválido." }, 400);

    const { data, error } = await supabase
      .from("veiculo")
      .select("id, clienteid, placa, placa_formatada, modelo, marca, ano, cor, kmatual, tipo")
      .eq("id", id)
      .single();

    if (error) {
      // quando não acha, o supabase pode retornar erro; tratamos como 404
      return respostaJSON({ error: "Veículo não encontrado." }, 404);
    }

    return respostaJSON({ veiculo: data });
  } catch (err: any) {
    console.error("GET /api/veiculos/[id]", err);
    return respostaJSON({ error: "Falha ao buscar veículo" }, 500);
  }
}

export async function PUT(request: Request, ctx: { params: Params }) {
  try {
    const id = idValido((ctx.params?.id || "").trim());
    if (!id) return respostaJSON({ error: "Parâmetro 'id' inválido." }, 400);

    const body = await request.json().catch(() => null);
    if (!body) return respostaJSON({ error: "JSON inválido no body." }, 400);

    const patch: any = {};

    if (body.placa !== undefined) {
      if (body.placa === null) return respostaJSON({ error: "Campo 'placa' não pode ser null." }, 400);
      const placaNorm = normalizarPlaca(String(body.placa));
      if (!placaNorm) return respostaJSON({ error: "Campo 'placa' inválido." }, 400);
      patch.placa = placaNorm;
    }

    if (body.modelo !== undefined) {
      if (body.modelo === null) return respostaJSON({ error: "Campo 'modelo' não pode ser null." }, 400);
      const modelo = String(body.modelo).trim();
      if (!modelo) return respostaJSON({ error: "Campo 'modelo' inválido." }, 400);
      patch.modelo = modelo;
    }

    if (body.marca !== undefined) {
      if (body.marca === null) return respostaJSON({ error: "Campo 'marca' não pode ser null." }, 400);
      const marca = String(body.marca).trim();
      if (!marca) return respostaJSON({ error: "Campo 'marca' inválido." }, 400);
      patch.marca = marca;
    }

    if (body.ano !== undefined) {
      if (body.ano === null) patch.ano = null;
      else {
        const ano = Number(body.ano);
        if (!Number.isInteger(ano) || ano < 1900 || ano > 3000) {
          return respostaJSON({ error: "Campo 'ano' inválido." }, 400);
        }
        patch.ano = ano;
      }
    }

    if (body.kmatual !== undefined) {
      if (body.kmatual === null) patch.kmatual = null;
      else {
        const km = Number(body.kmatual);
        if (!Number.isInteger(km) || km < 0) {
          return respostaJSON({ error: "Campo 'kmatual' inválido." }, 400);
        }
        patch.kmatual = km;
      }
    }

    if (body.cor !== undefined) {
      patch.cor = body.cor === null ? null : String(body.cor).trim();
    }

    if (body.tipo !== undefined) {
      if (body.tipo === null) return respostaJSON({ error: "Campo 'tipo' não pode ser null." }, 400);
      patch.tipo = String(body.tipo).trim();
    }

    if (body.clienteId !== undefined) {
      // opcional: permitir trocar dono do veículo
      if (body.clienteId === null) return respostaJSON({ error: "Campo 'clienteId' não pode ser null." }, 400);
      const clienteId = Number(body.clienteId);
      if (!Number.isInteger(clienteId) || clienteId <= 0) {
        return respostaJSON({ error: "Campo 'clienteId' inválido." }, 400);
      }
      patch.clienteid = clienteId;
    }

    if (Object.keys(patch).length === 0) {
      return respostaJSON({ error: "Nenhum campo para atualizar." }, 400);
    }

    patch.updatedat = new Date().toISOString();

    const { data, error } = await supabase
      .from("veiculo")
      .update(patch)
      .eq("id", id)
      .select("id, clienteid, placa, placa_formatada, modelo, marca, ano, cor, kmatual, tipo")
      .single();

    if (error) {
      // se não existir ou qualquer falha
      console.error("Supabase update error:", error);
      return respostaJSON({ error: "Falha ao atualizar veículo." }, 500);
    }

    return respostaJSON({ veiculo: data });
  } catch (err: any) {
    console.error("PUT /api/veiculos/[id]", err);
    return respostaJSON({ error: "Falha ao atualizar veículo" }, 500);
  }
}

export async function DELETE(_request: Request, ctx: { params: Params }) {
  try {
    const id = idValido((ctx.params?.id || "").trim());
    if (!id) return respostaJSON({ error: "Parâmetro 'id' inválido." }, 400);

    const { error } = await supabase.from("veiculo").delete().eq("id", id);
    if (error) throw error;

    return respostaJSON({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/veiculos/[id]", err);
    return respostaJSON({ error: "Falha ao remover veículo" }, 500);
  }
}
