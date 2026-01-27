// app/api/entradas/fiscal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface EntradaItemDTO {
  produtoId: number;
  quantidade: number;

  // opcionais (não quebram o front atual)
  valorUnitario?: number | null;
  valorDesconto?: number | null;
}

interface ParcelaDTO {
  dataVencimento: string; // ISO string ou "YYYY-MM-DD"
  valor: number;
}

interface RegistrarEntradaDTO {
  fornecedorId?: number | null;
  numeroNota?: string | number | null;
  notaChave?: string | null;
  fiscal?: boolean; // default true

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

function isPositiveNumber(n: any) {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

function isNonNegativeNumber(n: any) {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

export async function POST(req: NextRequest) {
  let entradaIdCriada: number | null = null;
  const estoqueAlterado: Array<{ produtoId: number; quantidade: number }> = [];

  try {
    const body = (await req.json()) as RegistrarEntradaDTO;

    const {
      fornecedorId,
      numeroNota,
      notaChave,
      fiscal = true,
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
      return NextResponse.json({ error: "Nenhum item de produto enviado." }, { status: 400 });
    }

    if (!nomePagador || !cpfCnpjPagador) {
      return NextResponse.json(
        {
          error: "Nome do pagador e CPF/CNPJ do pagador são obrigatórios para registrar a transação.",
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
          error: "Pagamentos futuros exigem pelo menos uma parcela com data de vencimento e valor.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------------------------
    // 1) CRIAR ENTRADA (CABEÇALHO)
    // ----------------------------------------------------------------
    const { data: entradaCriada, error: entradaError } = await supabaseAdmin
      .from("entrada")
      .insert({
        fornecedorid: fornecedorId ?? null,
        fiscal, // boolean
        notachave: notaChave ?? null,
        // tipo e status ficam no default do banco:
        // tipo: COMPRA_FORNECEDOR
        // status: RASCUNHO
      })
      .select("id")
      .single();

    if (entradaError || !entradaCriada) {
      console.error("Erro ao inserir em entrada:", entradaError);
      return NextResponse.json(
        { error: "Erro ao criar cabeçalho da entrada.", details: entradaError?.message },
        { status: 500 }
      );
    }

    entradaIdCriada = entradaCriada.id as number;

    // ----------------------------------------------------------------
    // 2) BUSCAR PRODUTOS (BULK) E PREPARAR ITENS
    // ----------------------------------------------------------------
    const produtoIds = Array.from(new Set(itens.map((i) => i.produtoId)));

    const { data: produtos, error: produtosError } = await supabaseAdmin
      .from("produto")
      .select(
        "id, titulo, descricao, estoque, unidade, ncm, csosn, cest, cfop, cst, aliquotaicms, cst_pis, aliquota_pis, cst_cofins, aliquota_cofins, precovenda"
      )
      .in("id", produtoIds);

    if (produtosError) {
      console.error("Erro ao buscar produtos:", produtosError);
      return NextResponse.json(
        { error: "Erro ao buscar produtos.", details: produtosError.message },
        { status: 500 }
      );
    }

    const produtoMap = new Map<number, any>((produtos ?? []).map((p: any) => [p.id, p]));
    for (const pid of produtoIds) {
      if (!produtoMap.has(pid)) {
        return NextResponse.json({ error: `Produto não encontrado. id=${pid}` }, { status: 404 });
      }
    }

    // valida itens + monta linhas de entradaitens
    const entradaItensRows = itens.map((item) => {
      const { produtoId, quantidade } = item;

      if (!produtoId || !quantidade || quantidade <= 0) {
        throw new Error(`Item inválido. produtoId=${produtoId}, quantidade=${quantidade}`);
      }

      const p = produtoMap.get(produtoId);

      // valor_unitario é obrigatório em entradaitens
      const valorUnitario =
        isNonNegativeNumber(item.valorUnitario) ? (item.valorUnitario as number) : Number(p.precovenda ?? 0);

      if (!Number.isFinite(valorUnitario)) {
        throw new Error(`Valor unitário inválido para produtoId=${produtoId}.`);
      }

      const valorDesconto = isNonNegativeNumber(item.valorDesconto) ? (item.valorDesconto as number) : 0;

      const valorTotal = Number(quantidade) * Number(valorUnitario) - Number(valorDesconto);

      return {
        entrada_id: entradaIdCriada,
        produto_id: produtoId,

        quantidade,
        valor_unitario: valorUnitario,
        valor_desconto: valorDesconto,
        valor_total: valorTotal,

        // snapshot (opcional, mas recomendado)
        descricao: p.titulo ?? p.descricao ?? null,
        unidade: p.unidade ?? null,
        ncm: p.ncm ?? null,
        csosn: p.csosn ?? null,
        cest: p.cest ?? null,
        cfop: p.cfop ?? null,
        cst: p.cst ?? null,
        aliquotaicms: p.aliquotaicms ?? null,
        cst_pis: p.cst_pis ?? null,
        aliquota_pis: p.aliquota_pis ?? null,
        cst_cofins: p.cst_cofins ?? null,
        aliquota_cofins: p.aliquota_cofins ?? null,
      };
    });

    // ----------------------------------------------------------------
    // 3) INSERIR ITENS DA ENTRADA (BULK)
    // ----------------------------------------------------------------
    const { error: itensInsertError } = await supabaseAdmin.from("entradaitens").insert(entradaItensRows);

    if (itensInsertError) {
      console.error("Erro ao inserir entradaitens:", itensInsertError);
      // rollback: apaga a entrada (cascade apaga itens, se tiver inserido parcialmente)
      await supabaseAdmin.from("entrada").delete().eq("id", entradaIdCriada);
      return NextResponse.json(
        { error: "Erro ao registrar itens da entrada.", details: itensInsertError.message },
        { status: 500 }
      );
    }

    // ----------------------------------------------------------------
    // 4) ATUALIZAR ESTOQUE (AGREGANDO POR PRODUTO)
    // ----------------------------------------------------------------
    const qtdPorProduto = new Map<number, number>();
    for (const item of itens) {
      const atual = qtdPorProduto.get(item.produtoId) ?? 0;
      qtdPorProduto.set(item.produtoId, atual + item.quantidade);
    }

    for (const [produtoId, qtdSomada] of qtdPorProduto.entries()) {
      const p = produtoMap.get(produtoId);
      const estoqueAtual = Number(p.estoque ?? 0);
      const novoEstoque = estoqueAtual + Number(qtdSomada);

      const { error: updateError } = await supabaseAdmin
        .from("produto")
        .update({
          estoque: novoEstoque,
          updatedat: new Date().toISOString(),
        })
        .eq("id", produtoId);

      if (updateError) {
        console.error("Erro ao atualizar estoque do produto:", updateError);

        // rollback best-effort:
        // - apaga entrada (cascade itens)
        // - tenta reverter estoques que já foram alterados
        await supabaseAdmin.from("entrada").delete().eq("id", entradaIdCriada);

        for (const upd of estoqueAlterado) {
          try {
            const { data: prodAtual } = await supabaseAdmin
              .from("produto")
              .select("id, estoque")
              .eq("id", upd.produtoId)
              .single();

            if (prodAtual) {
              const est = Number(prodAtual.estoque ?? 0);
              await supabaseAdmin
                .from("produto")
                .update({ estoque: est - Number(upd.quantidade) })
                .eq("id", upd.produtoId);
            }
          } catch {
            // sem transação, é best-effort
          }
        }

        return NextResponse.json(
          { error: "Erro ao atualizar estoque do produto.", details: updateError.message },
          { status: 500 }
        );
      }

      // registra para rollback best-effort
      estoqueAlterado.push({ produtoId, quantidade: qtdSomada });

      // atualiza map local
      p.estoque = novoEstoque;
    }

    // ----------------------------------------------------------------
    // 5) REGISTRAR TRANSAÇÕES (PARCELAS) SE FOR PAGAMENTO FUTURO
    // ----------------------------------------------------------------
    if (isPagamentoFuturo && parcelas.length > 0) {
      const descricaoBase =
        descricaoTransacao ||
        (numeroNota ? `Compra de mercadorias - NF ${numeroNota}` : "Compra de mercadorias (pagamento futuro)");

      const inserts = parcelas.map((parcela, index) => {
        const dataVencimentoRaw = parcela.dataVencimento;
        const data = dataVencimentoRaw.length <= 10 ? `${dataVencimentoRaw}T00:00:00` : dataVencimentoRaw;

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
          pendente: true,
        };
      });

      const { error: transacaoError } = await supabaseAdmin.from("transacao").insert(inserts);

      if (transacaoError) {
        console.error("Erro ao inserir transações de parcelas:", transacaoError);

        // rollback best-effort: apagar entrada (não reverte estoque aqui pra não complicar)
        // se você quiser, dá pra reverter também como acima.
        await supabaseAdmin.from("entrada").delete().eq("id", entradaIdCriada);

        return NextResponse.json(
          {
            error: "Erro ao registrar transações de pagamento futuro.",
            details: transacaoError.message,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Entrada registrada com sucesso.",
        entradaId: entradaIdCriada,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro inesperado ao registrar entrada:", error);

    // rollback best-effort: se criou o cabeçalho, apaga
    if (entradaIdCriada) {
      try {
        await supabaseAdmin.from("entrada").delete().eq("id", entradaIdCriada);
      } catch {}
    }

    return NextResponse.json(
      {
        error: "Erro inesperado ao registrar entrada.",
        details: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}
