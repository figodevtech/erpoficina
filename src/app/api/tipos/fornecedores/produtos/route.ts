// app/api/fornecedor-produtos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const fornecedorId = searchParams.get("fornecedorId");
  const codigoFornecedor = searchParams.get("codigoFornecedor");
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");

  const offset = (page - 1) * limit;

  // base query com join em produto e fornecedor
  let query = supabaseAdmin
    .from("fornecedorprodutos")
    .select(
      `
      id,
      codigofornecedor,
      ultimovalordecompra,
      fornecedor:fornecedorid (
        id,
        cpfcnpj,
        nomerazaosocial,
        nomefantasia
      ),
      produto:produtoid (
        id,
        titulo,
        descricao,
        codigobarras,
        precovenda,
        unidade,
        ncm
      )
    `,
      { count: "exact" }
    )
    .order("id", { ascending: true })
    .range(offset, offset + limit - 1);

  // filtro obrigatório por fornecedor, se vier
  if (fornecedorId) {
    query = query.eq("fornecedorid", Number(fornecedorId));
  }

  // filtro por código do fornecedor (p/ NF: cProd)
  if (codigoFornecedor) {
    // se quiser prefixo, usa `${codigoFornecedor}%`
    query = query.ilike("codigofornecedor", `${codigoFornecedor}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[GET /fornecedor-produtos] erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos do fornecedor" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: count ? Math.ceil(count / limit) : 1,
    },
  });
}
