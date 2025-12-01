// src/app/api/v1/transacoes/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/** Campos graváveis em transacao */
const WRITABLE_FIELDS = new Set([
  "ordemservicoid",
  "vendaid",
  "descricao",
  "valor",
  "valorLiquido",
  "data",
  "metodopagamento",
  "categoria",
  "tipo",
  "cliente_id",
  "banco_id",
  "nomepagador",
  "cpfcnpjpagador",
  "pendente",
]);

/** Campos retornados no select padrão (transacao) */
const TRANSACAO_FIELDS =
  "id, descricao, valor, valorLiquido, data, ordemservicoid, vendaid, metodopagamento, categoria, tipo, pendente, cliente_id, banco_id, created_at, updated_at";

/** Campos do banco (bancoconta) alinhados ao que você precisa no front */
const BANCO_FIELDS =
  "id, titulo, tipo, agencia, contanumero, proprietario, valorinicial, empresa_id, created_at, updated_at";

/* ========================= Helpers ========================= */

function toNullIfEmpty(v: unknown) {
  return typeof v === "string" && v.trim() === "" ? null : v;
}

function toNumberOrNull(v: any) {
  if (v == null || (typeof v === "string" && v.trim() === "")) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toDateISOStringOrNull(v: any) {
  if (v == null || (typeof v === "string" && v.trim() === "")) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/** Converte monetário (string/number) para centavos inteiros */
function moneyToCents(v: string | number | null | undefined): number | null {
  if (v == null) return null;
  if (typeof v === "number") return Math.round(v * 100);
  const cleaned = v.replace(",", ".").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

/** Formata centavos para R$ X,XX sem depender de ICU */
function brl(cents: number): string {
  const s = (cents / 100).toFixed(2).replace(".", ",");
  return `R$ ${s}`;
}

// Ajuste para o literal correto do seu enum (ex.: 'FINALIZADA')
const TARGET_STATUS_CONCLUIDA = "CONCLUIDO";
const TARGET_VENDA_STATUS_CONCLUIDA = "FINALIZADA";

/**
 * Saneia e valida payload de transacao:
 * - strings vazias -> null
 * - valor (real), banco_id (bigint), cliente_id (int) -> number
 * - data (timestamp tz) -> ISO string
 * - no POST (strict=true) exige obrigatórios
 */
function sanitizeTransacaoPayload(body: any, { strict }: { strict: boolean }) {
  const out: Record<string, any> = {};

  for (const key of Object.keys(body ?? {})) {
    if (!WRITABLE_FIELDS.has(key)) continue;

    switch (key) {
      case "valor": {
        out[key] = toNumberOrNull(body[key]);
        break;
      }
      case "valorLiquido": {
        out[key] = toNumberOrNull(body[key]);
        break;
      }
      case "banco_id": {
        out[key] = toNumberOrNull(body[key]);
        break;
      }
      case "cliente_id": {
        const n = toNumberOrNull(body[key]);
        out[key] = n == null ? null : Math.trunc(n);
        break;
      }
      case "data": {
        out[key] = toDateISOStringOrNull(body[key]);
        break;
      }
      default: {
        out[key] = toNullIfEmpty(body[key]);
      }
    }
  }

  if (strict) {
    const required = [
      "descricao",
      "valor",
      "data",
      "metodopagamento",
      "categoria",
      "tipo",
      "banco_id",
    ];
    const missing = required.filter((k) => out[k] == null);
    if (missing.length) {
      throw new Error(`Campos obrigatórios ausentes: ${missing.join(", ")}`);
    }
  }

  const nowIso = new Date().toISOString();
  if (strict) out.created_at = nowIso;
  out.updated_at = nowIso;

  return out;
}

/* ========================= GET (lista paginada + filtros) ========================= */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const limitRaw =
      searchParams.get("limit") ?? searchParams.get("pageSize") ?? "20";
    const limit = Math.min(Math.max(Number(limitRaw), 1), 100);

    const q = (searchParams.get("search") ?? searchParams.get("q") ?? "")
      .trim()
      .slice(0, 200);

    // Filtros opcionais
    const tipo = (searchParams.get("tipo") ?? "").trim(); // public.tipos_transacao
    const categoria = (searchParams.get("categoria") ?? "").trim(); // public.categoria_transacao
    const ordemservicoid = searchParams.get("ordemservicoid");
    const vendaid = searchParams.get("vendaid");
    const metodo = (
      searchParams.get("metodo") ??
      searchParams.get("metodopagamento") ??
      ""
    ).trim(); // public.metodo_pagamento
    const bancoId = toNumberOrNull(searchParams.get("bancoId"));
    const clienteId = toNumberOrNull(searchParams.get("clienteId"));

    // Intervalo de datas (inclusive)
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 🔹 Inclui o join do banco via FK explícita
    let query = supabaseAdmin
      .from("transacao")
      .select(
        `
        ${TRANSACAO_FIELDS},
        banco:bancoconta!transacao_banco_id_fkey ( ${BANCO_FIELDS} )
        `,
        { count: "exact" }
      )
      .order("data", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);

    if (q) {
      query = query.ilike("descricao", `%${q}%`);
    }
    if (ordemservicoid) query = query.eq("ordemservicoid", ordemservicoid);
    if (vendaid) query = query.eq("vendaid", vendaid);
    if (tipo) query = query.eq("tipo", tipo);
    if (categoria) query = query.eq("categoria", categoria);
    if (metodo) query = query.eq("metodopagamento", metodo);
    if (bancoId != null) query = query.eq("banco_id", bancoId);
    if (clienteId != null) query = query.eq("cliente_id", clienteId);

    if (dateFrom) {
      const iso = toDateISOStringOrNull(dateFrom);
      if (iso) query = query.gte("data", iso);
    }
    if (dateTo) {
      const iso = toDateISOStringOrNull(dateTo);
      if (iso) query = query.lte("data", iso);
    }

    const { data, error, count } = await query;
    if (error) throw error;

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
        tipo: tipo || null,
        categoria: categoria || null,
        metodopagamento: metodo || null,
        bancoId: bancoId ?? null,
        clienteId: clienteId ?? null,
        dateFrom: dateFrom ?? null,
        dateTo: dateTo ?? null,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erro ao listar transações" },
      { status: 500 }
    );
  }
}

/* ========================= POST (criar transacao + validação de pagamentos/OS) ========================= */

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as any;

    // Aceita payload bruto ou { newTransaction: {...} }
    const json =
      body?.newTransaction && typeof body.newTransaction === "object"
        ? body.newTransaction
        : body;

    console.log(json)

    if (!json || typeof json !== "object") {
      return NextResponse.json(
        { error: "Corpo da requisição inválido." },
        { status: 400 }
      );
    }

    const payload = sanitizeTransacaoPayload(json, { strict: true });

    // =================== Validações contra a OS (antes de inserir) ===================
    let preSumCents: number | null = null;
    let orcCents: number | null = null;
    let osId: number | null = null;
    let vendaId: number | null = null;
    const isReceita =
      typeof payload?.tipo === "string" &&
      payload.tipo.toUpperCase() === "RECEITA";

    // valida valor > 0 (para qualquer transação; pedido do usuário)
    const valorCents = moneyToCents(payload?.valor as any);
    if (valorCents == null || valorCents <= 0) {
      return NextResponse.json(
        { error: "O valor da transação deve ser maior que zero." },
        { status: 400 }
      );
    }

    if (payload?.ordemservicoid != null && isReceita) {
      osId = Number(payload.ordemservicoid);

      // 1) Busca orcamentototal da OS
      const { data: os, error: osErr } = await supabaseAdmin
        .from("ordemservico")
        .select("id, orcamentototal, status")
        .eq("id", osId)
        .maybeSingle();

      if (osErr) {
        return NextResponse.json(
          { error: "Erro ao buscar a ordem de serviço vinculada." },
          { status: 500 }
        );
      }
      if (!os) {
        return NextResponse.json(
          { error: "Ordem de serviço não encontrada." },
          { status: 404 }
        );
      }

      orcCents = moneyToCents(os.orcamentototal as any);
      if (orcCents == null || orcCents <= 0) {
        return NextResponse.json(
          { error: "A OS não possui orçamento válido para validação." },
          { status: 409 }
        );
      }

      // 2) Pagamento único não pode ultrapassar orçamento
      if (valorCents > orcCents) {
        return NextResponse.json(
          {
            error: `Pagamento único (${brl(
              valorCents
            )}) ultrapassa o valor da OS (${brl(orcCents)}).`,
          },
          { status: 409 }
        );
      }

      // 3) Soma pagamentos existentes + novo não pode ultrapassar
      const { data: transacoes, error: txErr } = await supabaseAdmin
        .from("transacao")
        .select("valor")
        .eq("ordemservicoid", osId)
        .eq("tipo", "RECEITA");

      if (txErr) {
        return NextResponse.json(
          { error: "Erro ao somar pagamentos existentes da OS." },
          { status: 500 }
        );
      }

      preSumCents =
        transacoes?.reduce((acc, t) => {
          const cents = moneyToCents(t.valor as any) ?? 0;
          return acc + cents;
        }, 0) ?? 0;

      const novoTotal = preSumCents + valorCents;
      if (novoTotal > orcCents) {
        const restante = orcCents - preSumCents;
        return NextResponse.json(
          {
            error: `A soma dos pagamentos ultrapassa o valor da OS. Restante permitido: ${brl(
              Math.max(restante, 0)
            )}.`,
          },
          { status: 409 }
        );
      }
    }


    if (payload?.vendaid != null && isReceita) {
      vendaId = Number(payload.vendaid);

      // 1) Busca orcamentototal da OS
      const { data: venda, error: osErr } = await supabaseAdmin
        .from("venda")
        .select("id, valortotal, status")
        .eq("id", vendaId)
        .maybeSingle();

      if (osErr) {
        return NextResponse.json(
          { error: "Erro ao buscar a venda vinculada." },
          { status: 500 }
        );
      }
      if (!venda) {
        return NextResponse.json(
          { error: "Venda não encontrada." },
          { status: 404 }
        );
      }

      orcCents = moneyToCents(venda.valortotal as any);
      if (orcCents == null || orcCents <= 0) {
        return NextResponse.json(
          { error: "A Venda não possui orçamento válido para validação." },
          { status: 409 }
        );
      }

      // 2) Pagamento único não pode ultrapassar orçamento
      if (valorCents > orcCents) {
        return NextResponse.json(
          {
            error: `Pagamento único (${brl(
              valorCents
            )}) ultrapassa o valor da Venda (${brl(orcCents)}).`,
          },
          { status: 409 }
        );
      }

      // 3) Soma pagamentos existentes + novo não pode ultrapassar
      const { data: transacoes, error: txErr } = await supabaseAdmin
        .from("transacao")
        .select("valor")
        .eq("vendaid", vendaId)
        .eq("tipo", "RECEITA");

      if (txErr) {
        return NextResponse.json(
          { error: "Erro ao somar pagamentos existentes da Venda." },
          { status: 500 }
        );
      }

      preSumCents =
        transacoes?.reduce((acc, t) => {
          const cents = moneyToCents(t.valor as any) ?? 0;
          return acc + cents;
        }, 0) ?? 0;

      const novoTotal = preSumCents + valorCents;
      if (novoTotal > orcCents) {
        const restante = orcCents - preSumCents;
        return NextResponse.json(
          {
            error: `A soma dos pagamentos ultrapassa o valor da Venda. Restante permitido: ${brl(
              Math.max(restante, 0)
            )}.`,
          },
          { status: 409 }
        );
      }
    }
    // =================== Fim validações pré-inserção ===================

    // 🔹 Insere e retorna já com o banco relacionado
    const { data, error } = await supabaseAdmin
      .from("transacao")
      .insert(payload)
      .select(
        `
        ${TRANSACAO_FIELDS},
        banco:bancoconta!transacao_banco_id_fkey ( ${BANCO_FIELDS} )
        `
      )
      .single();

    if (error) {
      // 23503 = foreign_key_violation (banco_id / cliente_id)
      if ((error as any).code === "23503") {
        const msg =
          (error as any).message ??
          "Violação de chave estrangeira. Verifique banco_id e cliente_id.";
        const detail = (error as any).details || (error as any).hint || "";
        const isBanco = /banco/i.test(msg + " " + detail);
        const isCliente = /cliente/i.test(msg + " " + detail);
        return NextResponse.json(
          {
            error: isBanco
              ? "Conta bancária (banco_id) inexistente."
              : isCliente
              ? "Cliente (cliente_id) inexistente."
              : "Referência inválida: banco_id/cliente_id.",
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: (error as any).message ?? "Erro ao criar transação." },
        { status: 500 }
      );
    }

    // =================== Pós-inserção: fechar OS se bateu orçamento ===================
    if (osId != null && preSumCents != null && orcCents != null) {
      const novoTotal = preSumCents + valorCents!;
      if (novoTotal === orcCents) {
        const { error: updErr } = await supabaseAdmin
          .from("ordemservico")
          .update({
            status: TARGET_STATUS_CONCLUIDA,
            updatedat: new Date().toISOString(),
          })
          .eq("id", osId);

        if (updErr) {
          // não invalida a criação da transação; apenas loga
          console.error("Falha ao atualizar status da OS:", updErr);
        }
      }
    }
    if (vendaId != null && preSumCents != null && orcCents != null) {
      const novoTotal = preSumCents + valorCents!;
      if (novoTotal === orcCents) {
        const { error: updErr } = await supabaseAdmin
          .from("venda")
          .update({
            status: TARGET_VENDA_STATUS_CONCLUIDA,
            updatedat: new Date().toISOString(),
          })
          .eq("id", vendaId);

        if (updErr) {
          // não invalida a criação da transação; apenas loga
          console.error("Falha ao atualizar status da Venda:", updErr);
        }
      }
    }
    // ===================================================================

    return NextResponse.json({ data, id: data.id }, { status: 201 });
  } catch (e: any) {
    const msg =
      e?.message ??
      "Erro ao criar transação. Verifique os campos obrigatórios e os tipos.";
    const isBadReq =
      msg.includes("Campos obrigatórios ausentes") ||
      msg.toLowerCase().includes("obrigatório");
    return NextResponse.json({ error: msg }, { status: isBadReq ? 400 : 500 });
  }
}
