import { NextResponse } from "next/server";
import axios from "axios";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizarPlaca(valor: string) {
  return valor.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

type LimiteConsultaPlaca = {
  permitido: boolean;
  empresa_id: number;
  limite: number;
  usadas: number;
  mes: string;
};

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
    const { data: limiteRaw, error: limiteError } = await supabaseAdmin
      .rpc("registrar_consulta_placa_empresa", { p_empresa_id: null })
      .maybeSingle();
    const limite = limiteRaw as LimiteConsultaPlaca | null;

    if (limiteError) {
      console.error("Erro ao registrar consulta de placa:", limiteError);
      return NextResponse.json(
        { error: "Falha ao verificar limite mensal de consultas de placa" },
        { status: 500 }
      );
    }

    if (!limite) {
      return NextResponse.json(
        { error: "Empresa nao configurada para controle de consultas de placa" },
        { status: 500 }
      );
    }

    if (!limite.permitido) {
      return NextResponse.json(
        {
          error: `Limite mensal de consultas de placa atingido (${limite.usadas}/${limite.limite}).`,
          limiteConsultasPlaca: {
            limite: limite.limite,
            usadas: limite.usadas,
            mes: limite.mes,
          },
        },
        { status: 429 }
      );
    }

    const url = `https://wdapi2.com.br/consulta/${placaNormalizada}/${token}`;
    const response = await axios.get(url);

    return NextResponse.json(
      {
        ...response.data,
        limiteConsultasPlaca: {
          limite: limite.limite,
          usadas: limite.usadas,
          mes: limite.mes,
        },
      },
      { status: 200 }
    );
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
