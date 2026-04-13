// src/app/api/venda/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { auth } from "@/lib/auth";

type Status =
  | "ORCAMENTO"
  | "ABERTA"
  | "PAGAMENTO"
  | "PENDENTE"
  | "PAGO"
  | "AUTORIZADO"
  | "FINALIZADA"
  | "CANCELADA"
  | "CANCELADO";
const STATUS_SET = new Set<Status>([
  "ORCAMENTO",
  "ABERTA",
  "PAGAMENTO",
  "PENDENTE",
  "PAGO",
  "AUTORIZADO",
  "FINALIZADA",
  "CANCELADA",
  "CANCELADO",
]);

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
  created_by: string; // uuid
  status: string; // enum_status_venda, ex: 'ABERTA', 'FINALIZADA', etc.
  formaPagamento?: string | null;
  descontoTipo?: string | null; // enum_tipo_desconto_venda
  descontoValor?: number | null;
  subTotal: number;
  valorTotal: number;
  dataVenda?: string | null; // opcional, ISO string. Se não vier, usa default do banco (now()).
  itens: VendaItemInput[];
};

const VENDA_SELECT = `
  id,
  clienteid,
  cliente:cliente (
  id, nomerazaosocial ),
  status,
  valortotal,
  datavenda,
  createdat,
  updatedat,
  created_by,
  criador:created_by ( id, nome ),
  canal,
  status_entrega,
  codigo_rastreio,
  transportadora_rastreio,
  ultimo_evento_rastreio,
  ultimo_evento_rastreio_em,
  status_rastreio,
  eventos_rastreio,
  rastreio_atualizado_em,
  nfe_chave_acesso,
  danfe_url,
  desconto_tipo,
  desconto_valor,
  observacoes_fiscais,
  forma_pagamento,
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
      precovenda
    )
  )
`;

/* ========================= GET ========================= */
/**
 * GET /api/venda
 *  - ?id=123                 : retorna uma venda específica com itens + produto
 *  - Sem id: lista paginada com filtros opcionais
 *      - page (padrão 1)
 *      - limit ou pageSize (padrão 20, máx 100)
 *      - clienteId
 *      - status
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clienteId = searchParams.get("clienteId");

    const statusParam = (searchParams.get("status") ?? "TODOS").toUpperCase();
    const statusFilter = STATUS_SET.has(statusParam as Status)
      ? (statusParam as Status)
      : null;
    // Paginação (para lista)
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const q = (
      searchParams.get("search") ??
      searchParams.get("q") ??
      ""
    ).trim();

    const limitRaw =
      searchParams.get("limit") ?? searchParams.get("pageSize") ?? "20";
    const limit = Math.min(Math.max(Number(limitRaw), 1), 100);

    // Se veio id, retorna somente uma venda específica (sem paginação)
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
        .select(VENDA_SELECT)
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

    // Lista paginada de vendas com filtros opcionais
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("venda")
      .select(VENDA_SELECT, { count: "exact" })
      .order("id", { ascending: false })
      .range(from, to);

    let clienteIdNum: number | null = null;

    if (q) {
      query = query.or(`id.ilike.%${q}%,valortotal.ilike.%${q}%`);
    }

    if (clienteId) {
      clienteIdNum = Number(clienteId);
      if (Number.isNaN(clienteIdNum)) {
        return NextResponse.json(
          { error: 'Parâmetro "clienteId" inválido.' },
          { status: 400 }
        );
      }
      query = query.eq("clienteid", clienteIdNum);
    }

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Erro ao listar vendas:", error);
      return NextResponse.json(
        { error: "Erro ao listar vendas." },
        { status: 500 }
      );
    }

    const items = data ?? [];
    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const pageCount = items.length;
    const hasPrevPage = page > 1;
    const hasNextPage = page * limit < total;

    return NextResponse.json({
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        pageCount,
        hasPrevPage,
        hasNextPage,
      },
      filters: {
        search: q,
        clienteId: clienteIdNum,
        status: statusFilter ?? null,
      },
    });
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
 * POST /api/venda
 * Body no formato de VendaPostBody.
 * Usa RPC fn_criar_venda_com_itens (transacional no banco).
 */
export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user.id) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    const body = (await req.json()) as VendaPostBody;

    body.created_by = session.user.id;

    console.log("Criando venda com body:", body);
    // Validação básica no backend
    if (
      !body ||
      typeof body !== "object" ||
      !body.clienteId ||
      !body.created_by ||
      !body.status ||
      body.subTotal == null ||
      body.valorTotal == null ||
      !Array.isArray(body.itens) ||
      body.itens.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Campos obrigatórios: clienteId, created_by, status, subTotal, valorTotal, itens[].",
        },
        { status: 400 }
      );
    }

    // Cada item precisa ter produtoId e quantidade > 0
    for (const item of body.itens) {
      if (!item.produtoId || !item.quantidade || item.quantidade <= 0) {
        return NextResponse.json(
          {
            error: "Cada item deve possuir produtoId e quantidade > 0.",
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
      const msg = (rpcError as any).message ?? "Erro ao criar venda.";
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

    if (body.formaPagamento !== undefined) {
      const { error: formaPagamentoError } = await supabaseAdmin
        .from("venda")
        .update({
          forma_pagamento: body.formaPagamento || null,
          updatedat: new Date().toISOString(),
        })
        .eq("id", vendaId);

      if (formaPagamentoError) {
        console.error("Venda criada, mas erro ao salvar forma_pagamento:", formaPagamentoError);
        return NextResponse.json(
          {
            error: "Venda criada, mas ocorreu um erro ao salvar a forma de pagamento.",
            vendaId,
          },
          { status: 500 }
        );
      }
    }

    const { data: vendaCanalRow, error: vendaCanalError } = await supabaseAdmin
      .from("venda")
      .select("id, canal")
      .eq("id", vendaId)
      .single();

    if (vendaCanalError) {
      console.error("Venda criada, mas erro ao verificar canal da venda:", vendaCanalError);
      return NextResponse.json(
        {
          error: "Venda criada, mas ocorreu um erro ao validar os campos de entrega.",
          vendaId,
        },
        { status: 500 }
      );
    }

    if (String((vendaCanalRow as any)?.canal ?? "").toUpperCase() !== "ONLINE") {
      const { error: sanitizeEntregaError } = await supabaseAdmin
        .from("venda")
        .update({
          status_entrega: null,
          codigo_rastreio: null,
          transportadora_rastreio: null,
          ultimo_evento_rastreio: null,
          ultimo_evento_rastreio_em: null,
          status_rastreio: null,
          eventos_rastreio: null,
          rastreio_atualizado_em: null,
          updatedat: new Date().toISOString(),
        })
        .eq("id", vendaId);

      if (sanitizeEntregaError) {
        console.error(
          "Venda criada, mas erro ao limpar campos de entrega para venda não ONLINE:",
          sanitizeEntregaError
        );
        return NextResponse.json(
          {
            error: "Venda criada, mas ocorreu um erro ao limpar os campos de entrega.",
            vendaId,
          },
          { status: 500 }
        );
      }
    }

    // Busca a venda completa (com itens + produto)
    const { data: vendaCompleta, error: vendaError } = await supabaseAdmin
      .from("venda")
      .select(VENDA_SELECT)
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
    return NextResponse.json({ error: msg }, { status: isBadReq ? 400 : 500 });
  }
}
