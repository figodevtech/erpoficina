import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TipoVeiculo = "CARROS" | "MOTOS" | "CAMINHOES";

type PlateProviderResponse = Record<string, unknown>;

function normalizarPlaca(valor: string) {
  return valor.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function respostaJSON(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function firstString(data: PlateProviderResponse, keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function firstNumber(data: PlateProviderResponse, keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const match = value.match(/\d{4}/);
      if (match) {
        return Number(match[0]);
      }
    }
  }
  return null;
}

function mapearTipo(valor: string | null): TipoVeiculo | null {
  if (!valor) return null;
  const texto = valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

  if (texto.includes("MOTO")) return "MOTOS";
  if (texto.includes("CAMINHAO")) return "CAMINHOES";
  if (texto.includes("CAMIONETA")) return "CARROS";
  if (texto.includes("AUTOMOVEL")) return "CARROS";
  if (texto.includes("CARRO")) return "CARROS";
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const placa = normalizarPlaca(request.nextUrl.searchParams.get("placa") || "");

    if (placa.length !== 7) {
      return respostaJSON(
        { error: "Parâmetro 'placa' inválido. Informe uma placa com 7 caracteres." },
        400
      );
    }

    const response = await fetch(`https://brasilapi.com.br/api/placa/v1/${placa}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.status === 404) {
      return respostaJSON(
        { error: "Nenhum veículo foi encontrado para a placa informada." },
        404
      );
    }

    if (!response.ok) {
      throw new Error(`Falha ao consultar placa (${response.status}).`);
    }

    const data = (await response.json()) as PlateProviderResponse;

    const marca = firstString(data, ["marca", "brand", "make"]);
    const modelo = firstString(data, ["modelo", "model"]);
    const cor = firstString(data, ["cor", "color"]);
    const chassi = firstString(data, ["chassi", "chassis"]);
    const tipoRaw = firstString(data, ["tipo", "tipoVeiculo", "vehicleType"]);
    const ano = firstNumber(data, ["anoModelo", "ano", "modelYear", "year"]);

    return respostaJSON({
      data: {
        placa,
        marca,
        modelo,
        ano,
        cor,
        chassi,
        tipo: mapearTipo(tipoRaw),
        raw: data,
      },
    });
  } catch (error: any) {
    console.error("GET /api/veiculos/placa", error);
    return respostaJSON(
      { error: error?.message || "Falha ao consultar dados da placa." },
      500
    );
  }
}
