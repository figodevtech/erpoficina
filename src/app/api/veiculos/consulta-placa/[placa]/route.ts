import { NextResponse } from "next/server";
import axios from "axios";

function normalizarPlaca(valor: string) {
  return valor.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ placa: string }> }
) {
  const { placa } = await ctx.params;
  const placaNormalizada = normalizarPlaca(placa || "");

  if (!placaNormalizada) {
    return NextResponse.json(
      { error: "Placa nao informada" },
      { status: 400 }
    );
  }

  if (!/^[A-Z]{3}(?:[0-9]{4}|[0-9][A-Z][0-9]{2})$/.test(placaNormalizada)) {
    return NextResponse.json(
      { error: "Placa invalida. Use o formato AAA0X00 ou AAA9999." },
      { status: 400 }
    );
  }

  const token = process.env.API_PLACAS_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "Token de API nao configurado" },
      { status: 500 }
    );
  }

  try {
    const url = `https://wdapi2.com.br/consulta/${placaNormalizada}/${token}`;
    const response = await axios.get(url);

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao consultar API de placas:", error.message);
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: error.response.data?.message || "Erro na consulta da placa" },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
