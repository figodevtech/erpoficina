// src/app/api/v1/venda/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type VendaItemInput = {
  produtoId: number;
  quantidade: number;
  subTotal: number;
  valorTotal: number;
  valorDesconto?: number | null;
  tipoDesconto?: string | null;
};

type VendaPostBody = {
  clienteId: number;
  usuarioCriadorId: string; // uuid
  status: string; // enum_status_venda, ex: 'ABERTA', 'FINALIZADA', etc.
  descontoTipo?: string | null; // enum_tipo_desconto_venda
  descontoValor?: number | null;
  subTotal: number;
  valorTotal: number;
  dataVenda?: string | null; // opcional, ISO string. Se não vier, usa default do banco (now()).
  itens: VendaItemInput[];
};

/* ========================= GET ========================= */
/**
 * GET /api/v1/venda
 *  - Sem query params: lista últimas vendas (limit 50)
 *  - ?id=123         : retorna uma venda específica com itens + produto
 *  - ?clienteId=1    : filtra por cliente
 *  - ?status=ABERTA  : filtra por status
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clienteId = searchParams.get("clienteId");
    const status = searchParams.get("status");

    // Se veio id, retorna somente uma venda específica
    if (id) {
      const vendaId = Number(id);
      if (Number.isNaN(vendaId)) {
        return NextResponse.json(
          { error: 'Parâmetro "id" inválido.' },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("venda")
        .select(
          `
          id,
          clienteid,
          status,
          valortotal,
          datavenda,
          createdat,
          updatedat,
          usuariocriadorid,
          desconto_tipo,
          desconto_valor,
          sub_total,
          itens:vendaproduto (
            id,
            produtoid,
            quantidade,
            sub_total,
            valor_total,
            valor_desconto,
            tipo_desconto,
            produto:produtoid (
              id,
              titulo,
              precovenda,
              imgUrl
            )
          )
        `
        )
        .eq("id", vendaId)
        .single();

      if (error) {
        console.error("Erro ao buscar venda por id:", error);
        return NextResponse.json(
          { error: "Erro ao buscar venda." },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: "Venda não encontrada." },
          { status: 404 }
        );
      }

      return NextResponse.json({ data });
    }

    // Caso não venha id, lista vendas com filtros opcionais
    let query = supabaseAdmin
      .from("venda")
      .select(
        `
        id,
        clienteid,
        status,
        valortotal,
        datavenda,
        createdat,
        updatedat,
        usuariocriadorid,
        desconto_tipo,
        desconto_valor,
        sub_total,
        itens:vendaproduto (
          id,
          produtoid,
          quantidade,
          sub_total,
          valor_total,
          valor_desconto,
          tipo_desconto,
          produto:produtoid (
            id,
            titulo,
            precovenda,
            imgUrl
          )
        )
      `
      )
      .order("createdat", { ascending: false })
      .limit(50);

    if (clienteId) {
      const clienteIdNum = Number(clienteId);
      if (Number.isNaN(clienteIdNum)) {
        return NextResponse.json(
          { error: 'Parâmetro "clienteId" inválido.' },
          { status: 400 }
        );
      }
      query = query.eq("clienteid", clienteIdNum);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao listar vendas:", error);
      return NextResponse.json(
        { error: "Erro ao listar vendas." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (e: any) {
    console.error("Erro inesperado no GET /venda:", e);
    return NextResponse.json(
      { error: e?.message || "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

/* ========================= POST ========================= */
/**
 * POST /api/v1/venda
 * Body no formato de VendaPostBody.
 * Usa RPC fn_criar_venda_com_itens (transacional no banco).
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as VendaPostBody;

    // Validação básica no backend
    if (
      !body ||
      typeof body !== "object" ||
      !body.clienteId ||
      !body.usuarioCriadorId ||
      !body.status ||
      !body.subTotal ||
      !body.valorTotal ||
      !Array.isArray(body.itens) ||
      body.itens.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Campos obrigatórios: clienteId, usuarioCriadorId, status, subTotal, valorTotal, itens[].",
        },
        { status: 400 }
      );
    }

    // Cada item precisa ter produtoId e quantidade > 0
    for (const item of body.itens) {
      if (!item.produtoId || !item.quantidade || item.quantidade <= 0) {
        return NextResponse.json(
          {
            error:
              "Cada item deve possuir produtoId e quantidade > 0.",
          },
          { status: 400 }
        );
      }
    }

    // Chama função RPC no Postgres (tudo transacional lá)
    const { data: vendaId, error: rpcError } = await supabaseAdmin.rpc(
      "fn_criar_venda_com_itens",
      {
        p_venda: body as any, // supabase converte objeto JS -> jsonb
      }
    );

    if (rpcError) {
      console.error("Erro na fn_criar_venda_com_itens:", rpcError);
      const msg =
        (rpcError as any).message ?? "Erro ao criar venda.";
      const isBadReq =
        msg.toLowerCase().includes("obrigatório") ||
        msg.toLowerCase().includes("estoque") ||
        msg.toLowerCase().includes("ausentes");
      return NextResponse.json(
        { error: msg },
        { status: isBadReq ? 400 : 500 }
      );
    }

    if (!vendaId) {
      return NextResponse.json(
        { error: "Função fn_criar_venda_com_itens não retornou id da venda." },
        { status: 500 }
      );
    }

    // Busca a venda completa (com itens + produto)
    const { data: vendaCompleta, error: vendaError } = await supabaseAdmin
      .from("venda")
      .select(
        `
        id,
        clienteid,
        status,
        valortotal,
        datavenda,
        createdat,
        updatedat,
        usuariocriadorid,
        desconto_tipo,
        desconto_valor,
        sub_total,
        itens:vendaproduto (
          id,
          produtoid,
          quantidade,
          sub_total,
          valor_total,
          valor_desconto,
          tipo_desconto,
          produto:produtoid (
            id,
            titulo,
            precovenda,
            imgUrl
          )
        )
      `
      )
      .eq("id", vendaId)
      .single();

    if (vendaError) {
      console.error("Venda criada, mas erro ao carregar detalhes:", vendaError);
      return NextResponse.json(
        {
          message:
            "Venda criada, mas ocorreu um erro ao carregar os detalhes da venda.",
          vendaId,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        message: "Venda criada com sucesso.",
        data: vendaCompleta,
        id: vendaCompleta.id,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("Erro inesperado no POST /venda:", e);
    const msg =
      e?.message ??
      "Erro ao criar venda. Verifique os campos obrigatórios e os tipos.";
    const isBadReq =
      msg.toLowerCase().includes("obrigatório") ||
      msg.toLowerCase().includes("ausentes");
    return NextResponse.json(
      { error: msg },
      { status: isBadReq ? 400 : 500 }
    );
  }
}
