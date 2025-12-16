import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Produto como vem do join
type ProdutoDb = {
  id: number;
  titulo: string;
  descricao: string | null;
  ncm: string | null;
  cfop: string | null;
  codigobarras: string | null;

  csosn: string | null;
  cst: string | null;
  cest: string | null;
  aliquotaicms: number | string | null;
  cst_pis: string | null;
  aliquota_pis: number | string | null;
  cst_cofins: string | null;
  aliquota_cofins: number | string | null;
};

type VendaProdutoDbRow = {
  id: number; // vendaproduto.id
  venda_id: number;
  produtoid: number;
  quantidade: number | string;
  sub_total: number | string;
  valor_total: number | string;
  valor_desconto: number | string | null;
  produto: ProdutoDb | ProdutoDb[] | null;
};

type ProdutoParaNfeDTO = {
  osProdutoId: string; // para reaproveitar o mesmo componente do front
  produtoId: number;

  titulo: string;
  descricao: string;

  quantidade: number;
  precoUnitario: number;
  subtotal: number;

  ncm: string | null;
  cfop: string | null;
  csosn: string | null;
  cst: string | null;
  cest: string | null;
  aliquotaicms: number | null;

  cst_pis: string | null;
  aliquota_pis: number | null;
  cst_cofins: string | null;
  aliquota_cofins: number | null;

  codigobarras: string | null;
};

function normalizarProduto(campo: VendaProdutoDbRow["produto"]): ProdutoDb | null {
  if (!campo) return null;
  return Array.isArray(campo) ? campo[0] ?? null : campo;
}

function toNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const vendaId = Number(id);

  if (!Number.isFinite(vendaId) || vendaId <= 0) {
    return NextResponse.json(
      { ok: false, message: "ID da venda inválido." },
      { status: 400 }
    );
  }

  try {
    // 1) garantir que venda existe
    const { data: venda, error: vendaError } = await supabaseAdmin
      .from("venda")
      .select("id")
      .eq("id", vendaId)
      .maybeSingle();

    if (vendaError) {
      console.error("Erro ao buscar venda:", vendaError);
      return NextResponse.json(
        { ok: false, message: "Erro ao buscar venda no banco." },
        { status: 500 }
      );
    }

    if (!venda) {
      return NextResponse.json(
        { ok: false, message: "Venda não encontrada." },
        { status: 404 }
      );
    }

    // 2) buscar itens da venda + dados do produto
    const { data: itens, error: itensError } = await supabaseAdmin
      .from("vendaproduto")
      .select(
        `
          id,
          venda_id,
          produtoid,
          quantidade,
          sub_total,
          valor_total,
          valor_desconto,
          produto:produto (
            id,
            titulo,
            descricao,
            ncm,
            cfop,
            codigobarras,
            csosn,
            cst,
            cest,
            aliquotaicms,
            cst_pis,
            aliquota_pis,
            cst_cofins,
            aliquota_cofins
          )
        `
      )
      .eq("venda_id", vendaId)
      .returns<VendaProdutoDbRow[]>();

    if (itensError) {
      console.error("Erro ao buscar produtos da venda:", itensError);
      return NextResponse.json(
        { ok: false, message: "Erro ao buscar produtos vinculados à venda." },
        { status: 500 }
      );
    }

    const resposta: ProdutoParaNfeDTO[] = (itens ?? []).map((row) => {
      const p = normalizarProduto(row.produto);

      const titulo = p?.titulo || `Produto #${row.produtoid}`;
      const descricao = p?.descricao || titulo;

      const quantidade = toNumber(row.quantidade);
      const valorTotal = toNumber(row.valor_total);
      const precoUnitario = quantidade > 0 ? valorTotal / quantidade : valorTotal;

      return {
        osProdutoId: `${vendaId}-${row.produtoid}`, // reaproveita o mesmo campo do front
        produtoId: row.produtoid,

        titulo,
        descricao,

        quantidade,
        precoUnitario,
        subtotal: toNumber(row.sub_total || row.valor_total),

        ncm: p?.ncm ?? null,
        cfop: p?.cfop ?? null,
        csosn: p?.csosn ?? null,
        cst: p?.cst ?? null,
        cest: p?.cest ?? null,
        aliquotaicms: p?.aliquotaicms != null ? Number(p.aliquotaicms) : null,

        cst_pis: p?.cst_pis ?? null,
        aliquota_pis: p?.aliquota_pis != null ? Number(p.aliquota_pis) : null,
        cst_cofins: p?.cst_cofins ?? null,
        aliquota_cofins:
          p?.aliquota_cofins != null ? Number(p.aliquota_cofins) : null,

        codigobarras: p?.codigobarras ?? null,
      };
    });

    return NextResponse.json({
      ok: true,
      vendaId,
      itens: resposta,
    });
  } catch (e: any) {
    console.error("Erro em GET /api/venda/[id]/produtos-para-nfe:", e);
    return NextResponse.json(
      {
        ok: false,
        message: "Erro interno ao buscar produtos da venda.",
        detalhe: String(e?.message ?? e),
      },
      { status: 500 }
    );
  }
}
