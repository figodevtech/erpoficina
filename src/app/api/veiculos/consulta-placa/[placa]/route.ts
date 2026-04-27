import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: Request,
  ctx: { params: Promise<{ placa: string }> }
) {
  const { placa } = await ctx.params;

  if (!placa) {
    return NextResponse.json(
      { error: "Placa não informada" },
      { status: 400 }
    );
  }

  const token = process.env.API_PLACAS_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "Token de API não configurado" },
      { status: 500 }
    );
  }

  try {
    const url = `https://wdapi2.com.br/consulta/${placa}/${token}`;
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
