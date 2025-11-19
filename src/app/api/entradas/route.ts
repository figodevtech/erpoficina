// src/app/api/entrada/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ENTRADA_FIELDS = `
  id, quantidade, created_at, produtoid, fornecedorid
`;

// Resumo do produto para retornar após a entrada
const PRODUTO_SUMMARY_FIELDS = `
  id, titulo, estoque, estoqueminimo, status_estoque
`;

// ============= Helpers =============

function toPositiveInt(value: any, field: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`${field} inválido.`);
  }
  return n;
}

// ============= GET /api/entrada =============
// Lista entradas. Opcionalmente filtra por produtoid: /api/entrada?produtoid=123

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const produtoIdParam = searchParams.get("produtoid");

    let query = supabaseAdmin
      .from("produtoentrada")
      .select(ENTRADA_FIELDS)
      .order("created_at", { ascending: false });

    if (produtoIdParam) {
      const produtoid = toPositiveInt(produtoIdParam, "produtoid");
      query = query.eq("produtoid", produtoid);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    const msg = e?.message ?? "Erro ao listar entradas.";
    const status = msg.includes("inválido") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

// ============= POST /api/entrada =============
// Cria uma entrada e já atualiza o estoque do produto.

export async function POST(req: NextRequest) {
  let entradaCriada: any | null = null;

  try {
    const body = await req.json().catch(() => ({} as any));

    const produtoid = toPositiveInt(body.produtoid, "produtoid");
    const fornecedorid = toPositiveInt(body.fornecedorid, "fornecedorid");
    const quantidade = toPositiveInt(body.quantidade, "quantidade");

    // 1) Garante que o produto existe e pega o estoque atual
    const { data: produtoAtual, error: produtoError } = await supabaseAdmin
      .from("produto")
      .select("id, estoque")
      .eq("id", produtoid)
      .single();

    if (produtoError) {
      if ((produtoError as any).code === "PGRST116") {
        return NextResponse.json(
          { error: "Produto não encontrado." },
          { status: 404 }
        );
      }
      throw produtoError;
    }

    if (!produtoAtual) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 }
      );
    }

    // 2) Cria a entrada
    const { data: entrada, error: entradaError } = await supabaseAdmin
      .from("produtoentrada")
      .insert({
        quantidade,
        produtoid,
        fornecedorid,
      })
      .select(ENTRADA_FIELDS)
      .single();

    if (entradaError) {
      // FK inválida, por exemplo fornecedor inexistente
      if ((entradaError as any).code === "23503") {
        return NextResponse.json(
          { error: "Produto ou fornecedor inválido." },
          { status: 400 }
        );
      }
      throw entradaError;
    }

    entradaCriada = entrada;

    // 3) Atualiza o estoque do produto
    const novoEstoque = (produtoAtual.estoque ?? 0) + quantidade;

    const { data: produtoAtualizado, error: updateError } = await supabaseAdmin
      .from("produto")
      .update({
        estoque: novoEstoque,
        updatedat: new Date().toISOString(),
      })
      .eq("id", produtoid)
      .select(PRODUTO_SUMMARY_FIELDS)
      .single();

    if (updateError) {
      throw updateError;
    }

    if (!produtoAtualizado) {
      // Caso MUITO raro: se não achar, tenta desfazer a entrada
      await supabaseAdmin
        .from("produtoentrada")
        .delete()
        .eq("id", entrada.id)
        .throwOnError();
      return NextResponse.json(
        { error: "Falha ao atualizar estoque do produto." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        entrada: entradaCriada,
        produto: produtoAtualizado,
      },
      { status: 201 }
    );
  } catch (e: any) {
    // Tentativa de rollback básica: se criou a entrada e falhou depois, tenta apagar
    if (entradaCriada?.id) {
      await supabaseAdmin
        .from("produtoentrada")
        .delete()
        .eq("id", entradaCriada.id);
    }

    const msg = e?.message ?? "Erro ao registrar entrada.";
    const status = msg.includes("inválido") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
