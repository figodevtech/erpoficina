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
      .select(
        "id, clienteid, placa, placa_formatada, modelo, marca, ano, cor, kmatual, tipo, cliente: cliente (id, nomerazaosocial, cpfcnpj)"
      )
      .eq("id", id)
      .single();

    if (error) {
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

    // ✅ agora pegamos de body.selectedVeiculo
    const v = body?.selectedVeiculo;
    if (!v || typeof v !== "object") {
      return respostaJSON({ error: "Body deve conter 'selectedVeiculo'." }, 400);
    }

    const patch: any = {};

    // placa
    if (v.placa !== undefined) {
      if (v.placa === null)
        return respostaJSON({ error: "Campo 'placa' não pode ser null." }, 400);

      const placaNorm = normalizarPlaca(String(v.placa));
      if (!placaNorm) return respostaJSON({ error: "Campo 'placa' inválido." }, 400);

      patch.placa = placaNorm;
    }

    // modelo
    if (v.modelo !== undefined) {
      if (v.modelo === null)
        return respostaJSON({ error: "Campo 'modelo' não pode ser null." }, 400);

      const modelo = String(v.modelo).trim();
      if (!modelo) return respostaJSON({ error: "Campo 'modelo' inválido." }, 400);

      patch.modelo = modelo;
    }

    // marca
    if (v.marca !== undefined) {
      if (v.marca === null)
        return respostaJSON({ error: "Campo 'marca' não pode ser null." }, 400);

      const marca = String(v.marca).trim();
      if (!marca) return respostaJSON({ error: "Campo 'marca' inválido." }, 400);

      patch.marca = marca;
    }

    // ano
    if (v.ano !== undefined) {
      if (v.ano === null) patch.ano = null;
      else {
        const ano = Number(v.ano);
        if (!Number.isInteger(ano) || ano < 1900 || ano > 3000) {
          return respostaJSON({ error: "Campo 'ano' inválido." }, 400);
        }
        patch.ano = ano;
      }
    }

    // kmatual
    if (v.kmatual !== undefined) {
      if (v.kmatual === null) patch.kmatual = null;
      else {
        const km = Number(v.kmatual);
        if (!Number.isInteger(km) || km < 0) {
          return respostaJSON({ error: "Campo 'kmatual' inválido." }, 400);
        }
        patch.kmatual = km;
      }
    }

    // cor
    if (v.cor !== undefined) {
      patch.cor = v.cor === null ? null : String(v.cor).trim();
    }

    // tipo
    if (v.tipo !== undefined) {
      if (v.tipo === null)
        return respostaJSON({ error: "Campo 'tipo' não pode ser null." }, 400);

      patch.tipo = String(v.tipo).trim();
    }

    // clienteId (aceita clienteId ou clienteid dentro do selectedVeiculo)
    const rawClienteId = v.clienteId ?? v.clienteid;
    if (rawClienteId !== undefined) {
      if (rawClienteId === null)
        return respostaJSON({ error: "Campo 'clienteId' não pode ser null." }, 400);

      const clienteId = Number(rawClienteId);
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
