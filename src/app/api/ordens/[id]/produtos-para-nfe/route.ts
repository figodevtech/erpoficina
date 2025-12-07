// src/app/api/ordens/[osId]/produtos-para-nfe/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Tipo que representa exatamente o que vem do Supabase (produto como ARRAY)
type OsProdutoDbRow = {
  ordemservicoid: number;
  produtoid: number;
  quantidade: number;
  precounitario: number;
  subtotal: number;
  produto: {
    id: number;
    titulo: string | null;
    descricao: string | null;
    ncm: string | null;
    cfop: string | null;
    codigobarras: string | null;
  }[] | null;
};

// Tipo que vamos devolver para o frontend
type ProdutoParaNfeDTO = {
  osProdutoId: number;
  produtoId: number;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  ncm: string | null;
  cfop: string | null;
  codigobarras: string | null;
};

// Extrai o osId direto da URL: /api/ordens/95/produtos-para-nfe
function getOsIdFromUrl(req: Request): number | null {
  const url = new URL(req.url);
  const parts = url.pathname.split("/"); // ["", "api", "ordens", "95", "produtos-para-nfe"]
  const idx = parts.indexOf("ordens");
  if (idx === -1 || idx + 1 >= parts.length) return null;

  const raw = parts[idx + 1];
  const n = Number(raw);

  if (Number.isNaN(n)) return null;
  return n;
}

export async function GET(req: Request) {
  try {
    const idOs = getOsIdFromUrl(req);

    if (idOs === null) {
      return NextResponse.json(
        {
          ok: false,
          message: "Parâmetro 'osId' inválido (deve ser numérico).",
        },
        { status: 400 }
      );
    }

    console.log(
      "GET /api/ordens/[osId]/produtos-para-nfe -> idOs:",
      idOs
    );

    // 1) Garantir que a OS existe
    const { data: os, error: osError } = await supabaseAdmin
      .from("ordemservico")
      .select("id")
      .eq("id", idOs)
      .maybeSingle();

    if (osError) {
      console.error("Erro ao buscar OS:", osError);
      return NextResponse.json(
        {
          ok: false,
          message: "Erro ao buscar OS no banco.",
        },
        { status: 500 }
      );
    }

    if (!os) {
      return NextResponse.json(
        {
          ok: false,
          message: "Ordem de serviço não encontrada.",
        },
        { status: 404 }
      );
    }

    // 2) Buscar itens da OS + dados do produto
    const { data: itens, error: itensError } = await supabaseAdmin
      .from("osproduto")
      .select(
        `
        ordemservicoid,
        produtoid,
        quantidade,
        precounitario,
        subtotal,
        produto:produto (
          id,
          titulo,
          descricao,
          ncm,
          cfop,
          codigobarras
        )
      `
      )
      .eq("ordemservicoid", idOs);

    if (itensError) {
      console.error("Erro ao buscar produtos da OS:", itensError);
      return NextResponse.json(
        {
          ok: false,
          message: "Erro ao buscar produtos vinculados à OS.",
        },
        { status: 500 }
      );
    }

    // Cast passando por any para não brigar com o TS
    const itensTyped = ((itens ?? []) as any) as OsProdutoDbRow[];

    const resposta: ProdutoParaNfeDTO[] = itensTyped.map((i) => {
      // Supabase trouxe produto como array -> pegamos o primeiro
      const p = i.produto?.[0] ?? null;
      const descricao =
        p?.titulo || p?.descricao || `Produto #${i.produtoid}`;

      return {
        osProdutoId: i.produtoid, // usamos produtoid como identificador no front
        produtoId: i.produtoid,
        descricao,
        quantidade: Number(i.quantidade ?? 0),
        precoUnitario: Number(i.precounitario ?? 0),
        subtotal: Number(i.subtotal ?? 0),
        ncm: p?.ncm ?? null,
        cfop: p?.cfop ?? null,
        codigobarras: p?.codigobarras ?? null,
      };
    });

    return NextResponse.json({
      ok: true,
      osId: idOs,
      itens: resposta,
    });
  } catch (e: any) {
    console.error(
      "Erro em GET /api/ordens/[osId]/produtos-para-nfe:",
      e
    );
    return NextResponse.json(
      {
        ok: false,
        message: "Erro interno ao buscar produtos da OS.",
        detalhe: String(e?.message ?? e),
      },
      { status: 500 }
    );
  }
}
