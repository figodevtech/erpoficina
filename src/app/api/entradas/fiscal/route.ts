// app/api/entradas/fiscal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface EntradaItemDTO {
  produtoId: number;
  quantidade: number;
}

interface ParcelaDTO {
  dataVencimento: string; // ISO string ou "YYYY-MM-DD"
  valor: number;
}

interface RegistrarEntradaDTO {
  fornecedorId?: number | null;
  numeroNota?: string | number | null;
  notaChave?: string | null; // nova
  fiscal?: boolean; // nova (default true para NF)

  itens: EntradaItemDTO[];

  isPagamentoFuturo: boolean;
  parcelas?: ParcelaDTO[];

  // Dados para criar transacao
  bancoId: number;
  metodoPagamento: string; // public.metodo_pagamento
  categoria: string; // public.categoria_transacao
  tipo: string; // public.tipos_transacao (ex: "DESPESA")

  descricaoTransacao?: string;
  nomePagador: string;
  cpfCnpjPagador: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegistrarEntradaDTO;

    const {
      fornecedorId,
      numeroNota,
      notaChave,
      fiscal = true, // se vier de NF, default é true
      itens,
      isPagamentoFuturo,
      parcelas = [],
      bancoId,
      metodoPagamento,
      categoria,
      tipo,
      descricaoTransacao,
      nomePagador,
      cpfCnpjPagador,
    } = body;

    // --- VALIDAÇÕES BÁSICAS ---
    if (!itens || itens.length === 0) {
      return NextResponse.json(
        { error: "Nenhum item de produto enviado." },
        { status: 400 }
      );
    }

    if (!nomePagador || !cpfCnpjPagador) {
      return NextResponse.json(
        {
          error:
            "Nome do pagador e CPF/CNPJ do pagador são obrigatórios para registrar a transação.",
        },
        { status: 400 }
      );
    }

    if (
      isPagamentoFuturo &&
      (!parcelas ||
        parcelas.length === 0 ||
        parcelas.some((p) => !p.dataVencimento || !p.valor))
    ) {
      return NextResponse.json(
        {
          error:
            "Pagamentos futuros exigem pelo menos uma parcela com data de vencimento e valor.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------------------------
    // 1) REGISTRAR ENTRADA POR PRODUTO E ATUALIZAR ESTOQUE
    // ----------------------------------------------------------------
    for (const item of itens) {
      const { produtoId, quantidade } = item;

      if (!produtoId || !quantidade || quantidade <= 0) {
        return NextResponse.json(
          {
            error: `Item inválido. produtoId=${produtoId}, quantidade=${quantidade}`,
          },
          { status: 400 }
        );
      }

      // 1.1) Insert em produtoentrada (agora com fiscal + notachave)
      const { error: entradaError } = await supabaseAdmin
        .from("produtoentrada")
        .insert({
          quantidade,
          produtoid: produtoId,
          fornecedorid: fornecedorId ?? null,
          fiscal, // boolean
          notachave: notaChave ?? null,
        });

      if (entradaError) {
        console.error("Erro ao inserir em produtoentrada:", entradaError);
        return NextResponse.json(
          {
            error: "Erro ao registrar entrada de produto.",
            details: entradaError.message,
          },
          { status: 500 }
        );
      }

      // 1.2) Buscar estoque atual do produto
      const { data: produto, error: produtoError } = await supabaseAdmin
        .from("produto")
        .select("estoque")
        .eq("id", produtoId)
        .single();

      if (produtoError || !produto) {
        console.error("Erro ao buscar produto:", produtoError);
        return NextResponse.json(
          {
            error: "Erro ao buscar produto para atualização de estoque.",
            details: produtoError?.message,
          },
          { status: 500 }
        );
      }

      const estoqueAtual = produto.estoque ?? 0;
      const novoEstoque = estoqueAtual + quantidade;

      // 1.3) Atualizar estoque
      const { error: updateError } = await supabaseAdmin
        .from("produto")
        .update({
          estoque: novoEstoque,
          updatedat: new Date().toISOString(),
        })
        .eq("id", produtoId);

      if (updateError) {
        console.error("Erro ao atualizar estoque do produto:", updateError);
        return NextResponse.json(
          {
            error: "Erro ao atualizar estoque do produto.",
            details: updateError.message,
          },
          { status: 500 }
        );
      }
    }

    // ----------------------------------------------------------------
    // 2) REGISTRAR TRANSAÇÕES (PARCELAS) SE FOR PAGAMENTO FUTURO
    // ----------------------------------------------------------------
    if (isPagamentoFuturo && parcelas.length > 0) {
      const descricaoBase =
        descricaoTransacao ||
        (numeroNota
          ? `Compra de mercadorias - NF ${numeroNota}`
          : "Compra de mercadorias (pagamento futuro)");

      const inserts = parcelas.map((parcela, index) => {
        // Se vier só "YYYY-MM-DD", transformamos em ISO com horário
        const dataVencimentoRaw = parcela.dataVencimento;
        const data =
          dataVencimentoRaw.length <= 10
            ? `${dataVencimentoRaw}T00:00:00`
            : dataVencimentoRaw;

        const descricao =
          parcelas.length > 1
            ? `${descricaoBase} - Parcela ${index + 1}/${parcelas.length}`
            : descricaoBase;

        return {
          descricao,
          valor: parcela.valor,
          valorLiquido: parcela.valor,
          data,
          metodopagamento: metodoPagamento,
          categoria,
          tipo,
          cliente_id: null,
          banco_id: bancoId,
          nomepagador: nomePagador,
          cpfcnpjpagador: cpfCnpjPagador,
          pendente: true, // despesa pendente (pagamento futuro)
        };
      });

      const { error: transacaoError } = await supabaseAdmin
        .from("transacao")
        .insert(inserts);

      if (transacaoError) {
        console.error("Erro ao inserir transações de parcelas:", transacaoError);
        return NextResponse.json(
          {
            error: "Erro ao registrar transações de pagamento futuro.",
            details: transacaoError.message,
          },
          { status: 500 }
        );
      }
    }

    // Sucesso
    return NextResponse.json(
      {
        success: true,
        message: "Entrada registrada com sucesso.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro inesperado ao registrar entrada:", error);
    return NextResponse.json(
      {
        error: "Erro inesperado ao registrar entrada.",
        details: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}
