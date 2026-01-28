// src/app/api/entrada/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ENTRADA_FIELDS = `
  id, created_at, fornecedorid, fiscal, notachave, tipo, status
`;

const ENTRADA_ITEM_RETURN_FIELDS = `
  id, entrada_id, produto_id, unidade, quantidade, precovenda,
  ncm, cest, csosn, referencia, titulo,
  "cClassTrib", "cstIbs", "cstCbs",
  cst, aliquotaicms, cfop,
  cst_pis, aliquota_pis,
  cst_cofins, aliquota_cofins
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

function toPositiveNumber(value: any, field: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${field} inválido.`);
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

function toNullableNonNegativeNumber(value: any, field: string): number | null {
  if (value === undefined || value === null || value === "") return null;
  return toNonNegativeNumber(value, field);
}

type EntradaItemInput = {
  // aceita ambos
  produtoid?: number;
  produto_id?: number;

  quantidade: number;
  precovenda?: number;

  unidade?: any | null; // unidade_medida enum

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
        id, produto_id, unidade, quantidade, precovenda,
        ncm, cest, csosn, referencia, titulo,
        "cClassTrib", "cstIbs", "cstCbs",
        cst, aliquotaicms, cfop,
        cst_pis, aliquota_pis,
        cst_cofins, aliquota_cofins
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
// Cria ENTRADA + ITENS e atualiza estoque.
// Força fiscal=false e notachave=null (mesmo que venham no body).
export async function POST(req: NextRequest) {
  let entradaCriada: any | null = null;
  const produtosAtualizados: Array<{ produto_id: number; delta: number }> = [];

  try {
    const body = await req.json().catch(() => ({} as any));

    const fornecedorid =
      body.fornecedorid === undefined || body.fornecedorid === null
        ? null
        : toPositiveInt(body.fornecedorid, "fornecedorid");

    // FIXOS POR REQUISITO
    const fiscal = false;
    const notachave = null;

    const tipo = body.tipo ?? null;
    if (tipo && !TIPOS_VALIDOS.has(String(tipo))) {
      return NextResponse.json(
        { error: "tipo inválido. Use COMPRA_FORNECEDOR | COMPRA_PF | DEVOLUCAO." },
        { status: 400 },
      );
    }

    // Itens (1 ou N) - mantive compat antigo
    const itens: EntradaItemInput[] = Array.isArray(body.itens)
      ? body.itens
      : [
          {
            produtoid: body.produtoid,
            quantidade: body.quantidade,
            precovenda: body.precovenda,
          },
        ];

    if (!itens.length) {
      return NextResponse.json({ error: "Informe ao menos 1 item." }, { status: 400 });
    }

    // Normaliza itens
    const itensNormalizados = itens.map((it, idx) => {
      const produto_id_raw = it.produto_id ?? it.produtoid;
      const produto_id = toPositiveInt(produto_id_raw, `itens[${idx}].produto_id`);
      const quantidade = toPositiveNumber(it.quantidade, `itens[${idx}].quantidade`);

      return {
        idx,
        produto_id,
        quantidade,
        precovenda_raw: it.precovenda,

        unidade: it.unidade ?? null,

        ncm: toNullableText(it.ncm),
        cest: toNullableText(it.cest),
        csosn: toNullableText(it.csosn),
        referencia: toNullableText(it.referencia),
        titulo: toNullableText(it.titulo),

        cClassTrib: toNullableText(it.cClassTrib),
        cstIbs: toNullableText(it.cstIbs),
        cstCbs: toNullableText(it.cstCbs),

        cst: toNullableText(it.cst),
        aliquotaicms: toNullableNonNegativeNumber(it.aliquotaicms, `itens[${idx}].aliquotaicms`),
        cfop: toNullableText(it.cfop),

        cst_pis: toNullableText(it.cst_pis),
        aliquota_pis: toNullableNonNegativeNumber(it.aliquota_pis, `itens[${idx}].aliquota_pis`),

        cst_cofins: toNullableText(it.cst_cofins),
        aliquota_cofins: toNullableNonNegativeNumber(it.aliquota_cofins, `itens[${idx}].aliquota_cofins`),
      };
    });

    const produtoIds = Array.from(new Set(itensNormalizados.map((i) => i.produto_id)));

    // 1) Busca produtos (validar existência + defaults)
    const { data: produtos, error: produtosError } = await supabaseAdmin
      .from("produto")
      .select(
        `
        id, estoque, unidade, precovenda,
        ncm, cest, csosn, cfop, referencia, titulo,
        "cClassTrib", "cstIbs", "cstCbs",
        cst, aliquotaicms,
        cst_pis, aliquota_pis,
        cst_cofins, aliquota_cofins
      `,
      )
      .in("id", produtoIds);

    if (produtosError) throw produtosError;

    const mapProduto = new Map<number, any>((produtos ?? []).map((p: any) => [p.id, p]));
    for (const pid of produtoIds) {
      if (!mapProduto.has(pid)) {
        return NextResponse.json({ error: `Produto ${pid} não encontrado.` }, { status: 404 });
      }
    }

    // 2) Cria cabeçalho da entrada
    const { data: entrada, error: entradaError } = await supabaseAdmin
      .from("entrada")
      .insert({
        fornecedorid,
        fiscal, // false
        notachave, // null
        ...(tipo ? { tipo } : {}),
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

    // 3) Itens (NOVO SCHEMA)
    const itensParaInserir = itensNormalizados.map((it) => {
      const p = mapProduto.get(it.produto_id);

      const precovenda =
        it.precovenda_raw === undefined || it.precovenda_raw === null
          ? Number(p?.precovenda ?? 0)
          : toNonNegativeNumber(it.precovenda_raw, `itens[${it.idx}].precovenda`);

      const unidade = it.unidade ?? (p?.unidade ?? "UN");

      return {
        entrada_id: entrada.id,
        produto_id: it.produto_id,

        quantidade: it.quantidade,
        precovenda,
        unidade,

        // snapshot (it pode sobrescrever; senão pega do produto)
        ncm: it.ncm ?? (p?.ncm ?? null),
        cest: it.cest ?? (p?.cest ?? null),
        csosn: it.csosn ?? (p?.csosn ?? null),
        referencia: it.referencia ?? (p?.referencia ?? null),
        titulo: it.titulo ?? (p?.titulo ?? null),

        "cClassTrib": it.cClassTrib ?? (p?.cClassTrib ?? p?.["cClassTrib"] ?? null),
        "cstIbs": it.cstIbs ?? (p?.cstIbs ?? p?.["cstIbs"] ?? null),
        "cstCbs": it.cstCbs ?? (p?.cstCbs ?? p?.["cstCbs"] ?? null),

        cst: it.cst ?? (p?.cst ?? null),
        aliquotaicms: it.aliquotaicms ?? (p?.aliquotaicms ?? null),
        cfop: it.cfop ?? (p?.cfop ?? null),

        cst_pis: it.cst_pis ?? (p?.cst_pis ?? null),
        aliquota_pis: it.aliquota_pis ?? (p?.aliquota_pis ?? null),

        cst_cofins: it.cst_cofins ?? (p?.cst_cofins ?? null),
        aliquota_cofins: it.aliquota_cofins ?? (p?.aliquota_cofins ?? null),
      };
    });

    const { data: itensCriados, error: itensError } = await supabaseAdmin
      .from("entradaitens")
      .insert(itensParaInserir)
      .select(ENTRADA_ITEM_RETURN_FIELDS);

    if (itensError) throw itensError;

    // 4) Atualiza estoque (agregado por produto)
    const agregados = new Map<number, number>();
    for (const it of itensNormalizados) {
      agregados.set(it.produto_id, (agregados.get(it.produto_id) ?? 0) + Number(it.quantidade));
    }

    for (const [produto_id, delta] of agregados.entries()) {
      const p = mapProduto.get(produto_id);
      const estoqueAtual = Number(p?.estoque ?? 0);
      const novoEstoque = estoqueAtual + Number(delta);

      const { error: updateError } = await supabaseAdmin
        .from("produto")
        .update({
          estoque: novoEstoque,
          updatedat: new Date().toISOString(),
        })
        .eq("id", produto_id);

      if (updateError) throw updateError;

      produtosAtualizados.push({ produto_id, delta });
      p.estoque = novoEstoque;
    }

    // 5) Resumo dos produtos envolvidos
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
      { status: 201 },
    );
  } catch (e: any) {
    // Rollback best-effort:
    // 1) reverte estoques
    for (const upd of produtosAtualizados) {
      try {
        const { data: p } = await supabaseAdmin
          .from("produto")
          .select("id, estoque")
          .eq("id", upd.produto_id)
          .single();

        if (p) {
          const estoqueAtual = Number(p.estoque ?? 0);
          const revertido = estoqueAtual - Number(upd.delta);
          await supabaseAdmin.from("produto").update({ estoque: revertido }).eq("id", upd.produto_id);
        }
      } catch {
        // best-effort
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
