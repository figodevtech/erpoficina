// src/app/api/entradas/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ENTRADA_FIELDS = `
  id, created_at, fornecedorid, fiscal, notachave, tipo, status
`;

const ENTRADA_ITEM_RETURN_FIELDS = `
  id, entrada_id, produto_id,
  unidade, quantidade, precovenda,
  ncm, cest, csosn, referencia, titulo,
  "cClassTrib", "cstIbs", "cstCbs",
  cst, aliquotaicms, cfop,
  cst_pis, aliquota_pis,
  cst_cofins, aliquota_cofins,
  created_at, updated_at
`;

const PRODUTO_SUMMARY_FIELDS = `
  id, titulo, estoque, estoqueminimo, status_estoque
`;

const TIPOS_VALIDOS = new Set(["COMPRA_FORNECEDOR", "COMPRA_PF", "DEVOLUCAO"]);

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

  // opcional: se vier, sobrescreve o precovenda do produto no snapshot do item
  precovenda?: number;

  // opcional: se você quiser permitir sobrescrever snapshot manualmente (senão, usa do produto)
  unidade?: any | null; // unidade_medida
  ncm?: string | null;
  cest?: string | null;
  csosn?: string | null;
  referencia?: string | null;
  titulo?: string | null;
  cClassTrib?: string | null;
  cstIbs?: string | null;
  cstCbs?: string | null;
  cst?: string | null;
  aliquotaicms?: number | null;
  cfop?: string | null;
  cst_pis?: string | null;
  aliquota_pis?: number | null;
  cst_cofins?: string | null;
  aliquota_cofins?: number | null;
};

// ============= GET /api/entrada =============
// Lista entradas. Opcionalmente filtra por produtoid: /api/entrada?produtoid=123

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const produtoIdParam = searchParams.get("produtoid");

    const selectComItens = (inner: boolean) => `
      id, created_at, fornecedorid, fiscal, notachave, tipo, status,
      entradaitens${inner ? "!inner" : ""}(
        id, produto_id,
        unidade, quantidade, precovenda,
        ncm, cest, csosn, referencia, titulo,
        "cClassTrib", "cstIbs", "cstCbs",
        cst, aliquotaicms, cfop,
        cst_pis, aliquota_pis,
        cst_cofins, aliquota_cofins,
        created_at, updated_at
      )
    `;

    let query = supabaseAdmin
      .from("entrada")
      .select(produtoIdParam ? selectComItens(true) : selectComItens(false))
      .order("created_at", { ascending: false });

    if (produtoIdParam) {
      const produtoid = toPositiveInt(produtoIdParam, "produtoid");
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
// Cria ENTRADA + 1 ITEM e atualiza estoque do produto.
//
// Body esperado (1 item):
// { fornecedorid?, fiscal?, notachave?, tipo?, produtoid, quantidade, precovenda? }

export async function POST(req: NextRequest) {
  let entradaCriada: any | null = null;
  let estoqueAtualizado = false;

  // para rollback do estoque
  let produto_id_rb: number | null = null;
  let quantidade_rb: number = 0;

  try {
    const body = await req.json().catch(() => ({} as any));

    const fornecedorid =
      body.fornecedorid === undefined || body.fornecedorid === null
        ? null
        : toPositiveInt(body.fornecedorid, "fornecedorid");

    // pode deixar o default do banco (false/null), mas mantendo compat com seu body atual
    const fiscal = Boolean(body.fiscal ?? false);
    const notachave = toNullableText(body.notachave);

    const tipo = body.tipo ?? null;
    if (tipo && !TIPOS_VALIDOS.has(String(tipo))) {
      return NextResponse.json(
        { error: "tipo inválido. Use COMPRA_FORNECEDOR | COMPRA_PF | DEVOLUCAO." },
        { status: 400 },
      );
    }

    // item único
    const item: EntradaItemInput = {
      produtoid: body.produtoid,
      quantidade: body.quantidade,
      precovenda: body.precovenda,

      unidade: body.unidade ?? null,
      ncm: body.ncm ?? null,
      cest: body.cest ?? null,
      csosn: body.csosn ?? null,
      referencia: body.referencia ?? null,
      titulo: body.titulo ?? null,
      cClassTrib: body.cClassTrib ?? null,
      cstIbs: body.cstIbs ?? null,
      cstCbs: body.cstCbs ?? null,
      cst: body.cst ?? null,
      aliquotaicms: body.aliquotaicms ?? null,
      cfop: body.cfop ?? null,
      cst_pis: body.cst_pis ?? null,
      aliquota_pis: body.aliquota_pis ?? null,
      cst_cofins: body.cst_cofins ?? null,
      aliquota_cofins: body.aliquota_cofins ?? null,
    };

    const produtoid = toPositiveInt(item.produtoid, "produtoid");
    // Como produto.estoque é integer, faz sentido manter quantidade inteira.
    const quantidade = toPositiveInt(item.quantidade, "quantidade");

    // 1) Busca produto (validar + snapshot)
    const { data: produto, error: produtoError } = await supabaseAdmin
      .from("produto")
      .select(
        `
        id, estoque,
        unidade, precovenda,
        ncm, cest, csosn, referencia, titulo,
        "cClassTrib", "cstIbs", "cstCbs",
        cst, aliquotaicms, cfop,
        cst_pis, aliquota_pis,
        cst_cofins, aliquota_cofins
      `,
      )
      .eq("id", produtoid)
      .single();

    if (produtoError) {
      if ((produtoError as any).code === "PGRST116") {
        return NextResponse.json({ error: `Produto ${produtoid} não encontrado.` }, { status: 404 });
      }
      throw produtoError;
    }

    // 2) Cria cabeçalho da entrada
    const { data: entrada, error: entradaError } = await supabaseAdmin
      .from("entrada")
      .insert({
        fornecedorid,
        fiscal,
        notachave,
        ...(tipo ? { tipo } : {}),
        // status: default do banco
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

    // 3) Monta snapshot do item (prioriza o que veio no body; se não veio, herda do produto)
    const precovendaSnapshot =
      item.precovenda === undefined || item.precovenda === null
        ? Number(produto.precovenda ?? 0)
        : toNonNegativeNumber(item.precovenda, "precovenda");

    const itemParaInserir = {
      entrada_id: entrada.id,
      produto_id: produtoid,

      quantidade,
      precovenda: precovendaSnapshot,

      unidade: item.unidade ?? produto.unidade, // NOT NULL na tabela
      ncm: toNullableText(item.ncm) ?? produto.ncm ?? null,
      cest: toNullableText(item.cest) ?? produto.cest ?? null,
      csosn: toNullableText(item.csosn) ?? produto.csosn ?? null,
      referencia: toNullableText(item.referencia) ?? produto.referencia ?? null,
      titulo: toNullableText(item.titulo) ?? produto.titulo ?? null,

      // colunas com aspas no banco:
      "cClassTrib": toNullableText(item.cClassTrib) ?? (produto as any)["cClassTrib"] ?? null,
      "cstIbs": toNullableText(item.cstIbs) ?? (produto as any)["cstIbs"] ?? null,
      "cstCbs": toNullableText(item.cstCbs) ?? (produto as any)["cstCbs"] ?? null,

      cst: toNullableText(item.cst) ?? produto.cst ?? null,
      aliquotaicms:
        item.aliquotaicms === undefined || item.aliquotaicms === null
          ? produto.aliquotaicms ?? null
          : toNonNegativeNumber(item.aliquotaicms, "aliquotaicms"),
      cfop: toNullableText(item.cfop) ?? produto.cfop ?? null,

      cst_pis: toNullableText(item.cst_pis) ?? produto.cst_pis ?? null,
      aliquota_pis:
        item.aliquota_pis === undefined || item.aliquota_pis === null
          ? produto.aliquota_pis ?? null
          : toNonNegativeNumber(item.aliquota_pis, "aliquota_pis"),

      cst_cofins: toNullableText(item.cst_cofins) ?? produto.cst_cofins ?? null,
      aliquota_cofins:
        item.aliquota_cofins === undefined || item.aliquota_cofins === null
          ? produto.aliquota_cofins ?? null
          : toNonNegativeNumber(item.aliquota_cofins, "aliquota_cofins"),
    };

    const { data: itemCriado, error: itemError } = await supabaseAdmin
      .from("entradaitens")
      .insert(itemParaInserir)
      .select(ENTRADA_ITEM_RETURN_FIELDS)
      .single();

    if (itemError) throw itemError;

    // 4) Atualiza estoque do produto (incrementa)
    const estoqueAtual = Number(produto.estoque ?? 0);
    const novoEstoque = estoqueAtual + quantidade;

    const { error: updateError } = await supabaseAdmin
      .from("produto")
      .update({
        estoque: novoEstoque,
        updatedat: new Date().toISOString(),
      })
      .eq("id", produtoid);

    if (updateError) throw updateError;

    estoqueAtualizado = true;
    produto_id_rb = produtoid;
    quantidade_rb = quantidade;

    // 5) Retorna resumo do produto
    const { data: produtoResumo, error: resumoError } = await supabaseAdmin
      .from("produto")
      .select(PRODUTO_SUMMARY_FIELDS)
      .eq("id", produtoid)
      .single();

    if (resumoError) throw resumoError;

    return NextResponse.json(
      {
        entrada: entradaCriada,
        item: itemCriado,
        produto: produtoResumo,
      },
      { status: 201 },
    );
  } catch (e: any) {
    // rollback best-effort:
    // 1) reverte estoque (se foi atualizado)
    if (estoqueAtualizado && produto_id_rb && quantidade_rb > 0) {
      try {
        const { data: p } = await supabaseAdmin
          .from("produto")
          .select("id, estoque")
          .eq("id", produto_id_rb)
          .single();

        if (p) {
          const estoqueAtual = Number(p.estoque ?? 0);
          const revertido = estoqueAtual - Number(quantidade_rb);
          await supabaseAdmin.from("produto").update({ estoque: revertido }).eq("id", produto_id_rb);
        }
      } catch {
        // sem transação, não há garantia
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
