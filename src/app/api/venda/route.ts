import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados nas variáveis de ambiente.');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

type VendaItemInput = {
  produtoId: number;
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

// GET /api/venda
// - Sem query params: lista as últimas vendas (com itens + produto básico)
// - ?id=123 → retorna uma venda específica com itens + produto
// - ?clienteId=1 → filtra por cliente
// - ?status=ABERTA → filtra por status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const clienteId = searchParams.get('clienteId');
    const status = searchParams.get('status');

    // Se veio id, retorna somente uma venda específica
    if (id) {
      const vendaId = Number(id);
      if (Number.isNaN(vendaId)) {
        return NextResponse.json(
          { error: 'Parâmetro "id" inválido.' },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('venda')
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
          vendaproduto:venda_id (
            id,
            produtoid,
            sub_total,
            valor_total,
            valor_desconto,
            tipo_desconto,
            produto:produtoid (
              id,
              titulo,
              precovenda,
              img_url
            )
          )
        `
        )
        .eq('id', vendaId)
        .single();

      if (error) {
        console.error('Erro ao buscar venda por id:', error);
        return NextResponse.json(
          { error: 'Erro ao buscar venda.' },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: 'Venda não encontrada.' },
          { status: 404 }
        );
      }

      return NextResponse.json(data);
    }

    // Caso não venha id, lista vendas com filtros opcionais
    let query = supabase
      .from('venda')
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
        vendaproduto:venda_id (
          id,
          produtoid,
          sub_total,
          valor_total,
          valor_desconto,
          tipo_desconto,
          produto:produtoid (
            id,
            titulo,
            precovenda,
            img_url
          )
        )
      `
      )
      .order('createdat', { ascending: false })
      .limit(50);

    if (clienteId) {
      const clienteIdNum = Number(clienteId);
      if (Number.isNaN(clienteIdNum)) {
        return NextResponse.json(
          { error: 'Parâmetro "clienteId" inválido.' },
          { status: 400 }
        );
      }
      query = query.eq('clienteid', clienteIdNum);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao listar vendas:', error);
      return NextResponse.json(
        { error: 'Erro ao listar vendas.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('Erro inesperado no GET /api/venda:', err);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

// POST /api/venda
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VendaPostBody;

    // (Opcional, mas recomendado) validação básica no backend
    if (
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
            'Campos obrigatórios: clienteId, usuarioCriadorId, status, subTotal, valorTotal, itens[].',
        },
        { status: 400 }
      );
    }

    // Chama função RPC no Postgres (tudo transacional lá)
    const { data: vendaId, error: rpcError } = await supabase.rpc(
      'fn_criar_venda_com_itens',
      {
        p_venda: body as any, // supabase converte objeto JS -> jsonb
      }
    );

    if (rpcError) {
      console.error('Erro na fn_criar_venda_com_itens:', rpcError);
      // Aqui você pode decidir se trata como 400 (erro de regra) ou 500 (erro interno)
      return NextResponse.json(
        { error: rpcError.message ?? 'Erro ao criar venda.' },
        { status: 400 }
      );
    }

    if (!vendaId) {
      return NextResponse.json(
        { error: 'Função fn_criar_venda_com_itens não retornou id da venda.' },
        { status: 500 }
      );
    }

    // Busca a venda completa (com itens + produto)
    const { data: vendaCompleta, error: vendaError } = await supabase
      .from('venda')
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
        vendaproduto:venda_id (
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
            img_url
          )
        )
      `
      )
      .eq('id', vendaId)
      .single();

    if (vendaError) {
      console.error('Venda criada, mas erro ao carregar detalhes:', vendaError);
      return NextResponse.json(
        {
          message:
            'Venda criada, mas ocorreu um erro ao carregar os detalhes da venda.',
          vendaId,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        message: 'Venda criada com sucesso.',
        venda: vendaCompleta,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Erro inesperado no POST /api/venda:', err);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

