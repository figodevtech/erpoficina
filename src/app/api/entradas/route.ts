// src/app/api/entrada/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ENTRADA_FIELDS = `
  id, created_at, fornecedorid, fiscal, notachave, tipo, status
`;

const ENTRADA_ITEM_RETURN_FIELDS = `
  id, entrada_id, produto_id, descricao, unidade, quantidade, valor_unitario, valor_desconto, valor_total
`;

const PRODUTO_SUMMARY_FIELDS = `
  id, titulo, estoque, estoqueminimo, status_estoque
`;

// ============= Helpers =============

function toPositiveInt(value: any, field: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`${field} inválido.`);
  return n;
}

function toNonNegativeNumber(value: any, field: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error(`${field} inválido.`);
  return n;
}

function toNullableText(value: any): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

type EntradaItemInput = {
  produtoid: number;
  quantidade: number;
  valor_unitario?: number;
  valor_desconto?: number;
  cfop?: string | null;
  csosn?: string | null;
  ncm?: string | null;
  cest?: string | null;
  unidade?: any | null; // unidade_medida enum
};

// ============= GET /api/entrada =============
// Lista entradas. Opcionalmente filtra por produtoid: /api/entrada?produtoid=123

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const produtoIdParam = searchParams.get("produtoid");

    // Se filtrar por produto, usamos inner join para conseguir filtrar pela tabela filha
    const selectComItens = (inner: boolean) => `
      id, created_at, fornecedorid, fiscal, notachave, tipo, status,
      entradaitens${inner ? "!inner" : ""}(
        id, produto_id, descricao, quantidade, valor_unitario, valor_desconto, valor_total
      )
    `;

    let query = supabaseAdmin
      .from("entrada")
      .select(produtoIdParam ? selectComItens(true) : selectComItens(false))
      .order("created_at", { ascending: false });

    if (produtoIdParam) {
      const produtoid = toPositiveInt(produtoIdParam, "produtoid");
      // filtro no relacionamento (só funciona com !inner no select)
      query = query.eq("entradaitens.produto_id", produtoid);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (e: any) {
    const msg = e?.message ?? "Erro ao listar entradas.";
    const status = msg.includes("inválido") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

// ============= POST /api/entrada =============
// Cria uma ENTRADA (cabeçalho) e seus ITENS e já atualiza o estoque.
//
// Suporta 2 formatos de body:
// 1) (modo antigo do dropdown: 1 item)
//    { fornecedorid, produtoid, quantidade, valor_unitario?, valor_desconto?, fiscal?, notachave?, tipo? }
// 2) (modo novo: vários itens)
//    { fornecedorid, fiscal?, notachave?, tipo?, itens: [{ produtoid, quantidade, valor_unitario?, valor_desconto? }, ...] }

export async function POST(req: NextRequest) {
  let entradaCriada: any | null = null;
  const produtosAtualizados: Array<{ produtoid: number; quantidade: number }> = [];

  try {
    const body = await req.json().catch(() => ({} as any));

    // Cabeçalho
    const fornecedorid =
      body.fornecedorid === undefined || body.fornecedorid === null
        ? null
        : toPositiveInt(body.fornecedorid, "fornecedorid");

    const fiscal = Boolean(body.fiscal ?? false);
    const notachave = toNullableText(body.notachave);
    const tipo = body.tipo; // enum_tipos_entrada (se não vier, o default do banco assume)

    // Itens (1 ou N)
    const itens: EntradaItemInput[] = Array.isArray(body.itens)
      ? body.itens
      : [
          {
            produtoid: body.produtoid,
            quantidade: body.quantidade,
            valor_unitario: body.valor_unitario,
            valor_desconto: body.valor_desconto,
          },
        ];

    if (!itens.length) {
      return NextResponse.json({ error: "Informe ao menos 1 item." }, { status: 400 });
    }

    // Valida itens e coleta IDs
    const itensNormalizados = itens.map((it, idx) => {
      const produtoid = toPositiveInt(it.produtoid, `itens[${idx}].produtoid`);
      const quantidade = toPositiveInt(it.quantidade, `itens[${idx}].quantidade`);
      const valor_desconto = it.valor_desconto === undefined ? 0 : toNonNegativeNumber(it.valor_desconto, `itens[${idx}].valor_desconto`);
      const valor_unitario_raw = it.valor_unitario; // pode ser undefined -> fallback
      return { produtoid, quantidade, valor_unitario_raw, valor_desconto };
    });

    const produtoIds = Array.from(new Set(itensNormalizados.map((i) => i.produtoid)));

    // 1) Busca produtos (pra validar existência e pegar defaults)
    const { data: produtos, error: produtosError } = await supabaseAdmin
      .from("produto")
      .select(
        "id, titulo, descricao, estoque, unidade, ncm, csosn, cest, cfop, cst, aliquotaicms, cst_pis, aliquota_pis, cst_cofins, aliquota_cofins, precovenda"
      )
      .in("id", produtoIds);

    if (produtosError) throw produtosError;

    const mapProduto = new Map<number, any>((produtos ?? []).map((p: any) => [p.id, p]));
    for (const pid of produtoIds) {
      if (!mapProduto.has(pid)) {
        return NextResponse.json({ error: `Produto ${pid} não encontrado.` }, { status: 404 });
      }
    }

    // 2) Cria o cabeçalho da entrada
    const { data: entrada, error: entradaError } = await supabaseAdmin
      .from("entrada")
      .insert({
        fornecedorid,
        fiscal,
        notachave,
        ...(tipo ? { tipo } : {}), // só seta se vier
        // status: deixa o default do banco (RASCUNHO)
      })
      .select(ENTRADA_FIELDS)
      .single();

    if (entradaError) {
      if ((entradaError as any).code === "23503") {
        return NextResponse.json({ error: "Fornecedor inválido." }, { status: 400 });
      }
      throw entradaError;
    }

    entradaCriada = entrada;

    // 3) Cria os itens da entrada
    const itensParaInserir = itensNormalizados.map((it, idx) => {
      const p = mapProduto.get(it.produtoid);

      // Fallback: se não vier custo, usa precovenda (ideal é mandar custo no body!)
      const valor_unitario =
        it.valor_unitario_raw === undefined || it.valor_unitario_raw === null
          ? Number(p?.precovenda ?? 0)
          : toNonNegativeNumber(it.valor_unitario_raw, `itens[${idx}].valor_unitario`);

      const valor_total = Number(it.quantidade) * Number(valor_unitario) - Number(it.valor_desconto ?? 0);

      return {
        entrada_id: entrada.id,
        produto_id: it.produtoid,
        quantidade: it.quantidade,
        valor_unitario,
        valor_desconto: it.valor_desconto ?? 0,
        valor_total,

        // snapshot do produto (pode ajustar conforme seu fluxo)
        descricao: p?.titulo ?? p?.descricao ?? null,
        unidade: p?.unidade ?? null,
        ncm: p?.ncm ?? null,
        csosn: p?.csosn ?? null,
        cest: p?.cest ?? null,
        cfop: p?.cfop ?? null,
        cst: p?.cst ?? null,
        aliquotaicms: p?.aliquotaicms ?? null,
        cst_pis: p?.cst_pis ?? null,
        aliquota_pis: p?.aliquota_pis ?? null,
        cst_cofins: p?.cst_cofins ?? null,
        aliquota_cofins: p?.aliquota_cofins ?? null,
      };
    });

    const { data: itensCriados, error: itensError } = await supabaseAdmin
      .from("entradaitens")
      .insert(itensParaInserir)
      .select(ENTRADA_ITEM_RETURN_FIELDS);

    if (itensError) throw itensError;

    // 4) Atualiza estoque de cada produto (incrementa)
    // (Sem transação: fazemos o melhor esforço e tentamos reverter se algo der errado)
    for (const it of itensNormalizados) {
      const p = mapProduto.get(it.produtoid);
      const estoqueAtual = Number(p?.estoque ?? 0);
      const novoEstoque = estoqueAtual + Number(it.quantidade);

      const { error: updateError } = await supabaseAdmin
        .from("produto")
        .update({
          estoque: novoEstoque,
          updatedat: new Date().toISOString(),
        })
        .eq("id", it.produtoid);

      if (updateError) throw updateError;

      produtosAtualizados.push({ produtoid: it.produtoid, quantidade: it.quantidade });
      // atualiza o map local pra refletir increments acumulados
      p.estoque = novoEstoque;
    }

    // Retorna também o resumo dos produtos envolvidos (opcional)
    const { data: produtosResumo, error: resumoError } = await supabaseAdmin
      .from("produto")
      .select(PRODUTO_SUMMARY_FIELDS)
      .in("id", produtoIds);

    if (resumoError) throw resumoError;

    return NextResponse.json(
      {
        entrada: entradaCriada,
        itens: itensCriados ?? [],
        produtos: produtosResumo ?? [],
      },
      { status: 201 }
    );
  } catch (e: any) {
    // Rollback best-effort:
    // 1) tenta reverter estoques
    for (const upd of produtosAtualizados) {
      try {
        const { data: p } = await supabaseAdmin
          .from("produto")
          .select("id, estoque")
          .eq("id", upd.produtoid)
          .single();

        if (p) {
          const estoqueAtual = Number(p.estoque ?? 0);
          const revertido = estoqueAtual - Number(upd.quantidade);
          await supabaseAdmin.from("produto").update({ estoque: revertido }).eq("id", upd.produtoid);
        }
      } catch {
        // se falhar, não tem muito o que fazer aqui sem transação
      }
    }

    // 2) apaga a entrada (cascade apaga itens)
    if (entradaCriada?.id) {
      await supabaseAdmin.from("entrada").delete().eq("id", entradaCriada.id);
    }

    const msg = e?.message ?? "Erro ao registrar entrada.";
    const status = msg.includes("inválido") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
