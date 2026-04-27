import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TipoVeiculoApi = "carros" | "motos" | "caminhoes";

const TIPOS_VALIDOS = new Set<TipoVeiculoApi>(["carros", "motos", "caminhoes"]);

function normalizarTipo(raw: string | null): TipoVeiculoApi | null {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase();
  return TIPOS_VALIDOS.has(value as TipoVeiculoApi)
    ? (value as TipoVeiculoApi)
    : null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = normalizarTipo(searchParams.get("tipo"));
    const marcaId = searchParams.get("marcaId");

    if (!tipo) {
      return NextResponse.json(
        { error: "Parâmetro 'tipo' inválido." },
        { status: 400 }
      );
    }

    if (!marcaId) {
      const response = await fetch(
        `https://parallelum.com.br/fipe/api/v1/${tipo}/marcas`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error(`Falha ao buscar marcas (${response.status}).`);
      }

      const data = (await response.json()) as Array<{ nome: string; codigo: string }>;
      const marcas = Array.isArray(data)
        ? data.map((item) => ({
            nome: String(item.nome ?? ""),
            valor: Number(item.codigo),
          }))
        : [];

      return NextResponse.json({ marcas }, { status: 200 });
    }

    const response = await fetch(
      `https://parallelum.com.br/fipe/api/v1/${tipo}/marcas/${marcaId}/modelos`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Falha ao buscar modelos (${response.status}).`);
    }

    const data = (await response.json()) as {
      modelos?: Array<{ nome: string }>;
    };

    const modelos = Array.isArray(data?.modelos)
      ? data.modelos.map((item) => ({
          modelo: String(item.nome ?? "").toUpperCase(),
        }))
      : [];

    return NextResponse.json({ modelos }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/fipe/veiculos", error);
    return NextResponse.json(
      { error: error?.message ?? "Falha ao buscar dados da FIPE." },
      { status: 500 }
    );
  }
}
