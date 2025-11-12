// src/app/api/ordens/[id]/orcamento/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server role
  { auth: { persistSession: false, autoRefreshToken: false } }
);

type Num = number;
const toNum = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* =========================================================
 * GET — itens do orçamento (produtos + serviços)
 * ========================================================= */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const osId = Number(id);
    if (!osId || Number.isNaN(osId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Produtos com descrição
    const { data: prodRows, error: prodErr } = await supabase
      .from("osproduto")
      .select(`
        ordemservicoid,
        produtoid,
        quantidade,
        precounitario,
        subtotal,
        produto:produtoid (descricao, titulo)
      `)
      .eq("ordemservicoid", osId);

    if (prodErr) throw prodErr;

    const produtos = (prodRows ?? []).map((r: any) => ({
      produtoid: toNum(r.produtoid),
      descricao: String(r.produto?.descricao ?? r.produto?.titulo ?? ""),
      quantidade: toNum(r.quantidade ?? 1),
      precounitario: toNum(r.precounitario ?? 0),
      subtotal: toNum(r.subtotal ?? 0),
    }));

    // Serviços com descrição
    const { data: servRows, error: servErr } = await supabase
      .from("osservico")
      .select(`
        ordemservicoid,
        servicoid,
        quantidade,
        precounitario,
        subtotal,
        servico:servicoid (descricao)
      `)
      .eq("ordemservicoid", osId);

    if (servErr) throw servErr;

    const servicos = (servRows ?? []).map((r: any) => ({
      servicoid: toNum(r.servicoid),
      descricao: String(r.servico?.descricao ?? ""),
      quantidade: toNum(r.quantidade ?? 1),
      precounitario: toNum(r.precounitario ?? 0),
      subtotal: toNum(r.subtotal ?? 0),
    }));

    return NextResponse.json(
      { produtos, servicos },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("GET /api/ordens/[id]/orcamento", err);
    return NextResponse.json(
      { error: "Falha ao carregar orçamento" },
      { status: 500 }
    );
  }
}

/* =========================================================
 * PUT — salva orçamento com sincronismo de estoque
 *
 * - Calcula diffs entre o que está salvo e o que chegou
 * - Valida estoque disponível antes de aplicar
 * - Ajusta estoque do produto e tabela osproduto_baixa
 * - Atualiza osproduto/osservico e orcamentototal
 * - Nunca permite ultrapassar estoque (responde 409 com itens faltantes)
 * ========================================================= */
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const osId = Number(id);
    if (!osId || Number.isNaN(osId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const produtosBody: Array<{
      produtoid: Num;
      quantidade: Num;
      precounitario: Num;
      subtotal?: Num;
    }> = Array.isArray(body?.produtos) ? body.produtos : [];

    const servicosBody: Array<{
      servicoid: Num;
      quantidade: Num;
      precounitario: Num;
      subtotal?: Num;
    }> = Array.isArray(body?.servicos) ? body.servicos : [];

    // Normaliza (não aceitaremos números negativos)
    const desejados = produtosBody
      .map((p) => ({
        produtoid: toNum(p.produtoid),
        quantidade: Math.max(0, toNum(p.quantidade)),
        precounitario: toNum(p.precounitario),
        subtotal:
          p.subtotal !== undefined
            ? toNum(p.subtotal)
            : toNum(p.quantidade) * toNum(p.precounitario),
      }))
      // se veio quantidade 0, tratamos como remoção (não insere)
      .filter((p) => p.quantidade > 0);

    // Leitura atual de itens, baixas e estoques
    const [{ data: atuaisRows, error: atuaisErr }, { data: baixaRows, error: baixaErr }] =
      await Promise.all([
        supabase
          .from("osproduto")
          .select("produtoid, quantidade")
          .eq("ordemservicoid", osId),
        supabase
          .from("osproduto_baixa")
          .select("produtoid, quantidade")
          .eq("ordemservicoid", osId),
      ]);

    if (atuaisErr) throw atuaisErr;
    if (baixaErr) throw baixaErr;

    const atuaisMap = new Map<number, number>(); // produtoid -> quantidade salva
    (atuaisRows || []).forEach((r: any) => {
      atuaisMap.set(toNum(r.produtoid), toNum(r.quantidade));
    });

    const baixaMap = new Map<number, number>(); // produtoid -> quantidade já baixada p/ esta OS
    (baixaRows || []).forEach((r: any) => {
      baixaMap.set(toNum(r.produtoid), toNum(r.quantidade));
    });

    const desejadosMap = new Map<number, { quantidade: number; precounitario: number; subtotal: number }>();
    desejados.forEach((d) => {
      desejadosMap.set(d.produtoid, {
        quantidade: d.quantidade,
        precounitario: d.precounitario,
        subtotal: d.subtotal!,
      });
    });

    // Conjunto de todos os produtos envolvidos
    const allProdIds = Array.from(
      new Set<number>([
        ...Array.from(atuaisMap.keys()),
        ...Array.from(desejadosMap.keys()),
      ])
    );

    // Busca estoques/títulos dos produtos envolvidos
    const { data: prodInfos, error: prodInfoErr } = allProdIds.length
      ? await supabase
          .from("produto")
          .select("id, estoque, titulo")
          .in("id", allProdIds)
      : { data: [], error: null };

    if (prodInfoErr) throw prodInfoErr;

    const estoqueMap = new Map<number, number>(); // produtoid -> estoque atual
    const tituloMap = new Map<number, string>(); // produtoid -> titulo
    (prodInfos || []).forEach((p: any) => {
      estoqueMap.set(toNum(p.id), toNum(p.estoque));
      tituloMap.set(toNum(p.id), String(p.titulo ?? "Produto"));
    });

    // Validação de disponibilidade (não permite ultrapassar estoque)
    // Regra: baixa final desejada deve ser atendida pelo estoque disponível atual + estorno do que já estava reservado para a própria OS
    // disponibilidade = estoqueAtual + (quantidade já baixada para esta OS) - (quantidade a reservar nova)
    // Mas como a baixa final == quantidade desejada, a reserva nova é (desejada - baixadaAtual). Se negativa, é estorno (ok).
    const faltantes: Array<{ id: number; titulo: string; disponivel: number; solicitado: number }> = [];

    allProdIds.forEach((pid) => {
      const desejada = desejadosMap.get(pid)?.quantidade ?? 0;
      const baixadaAtual = baixaMap.get(pid) ?? 0;
      const deltaReserva = desejada - baixadaAtual; // o que precisa aumentar (se > 0)
      if (deltaReserva > 0) {
        const estoqueAtual = estoqueMap.get(pid) ?? 0;
        const disponivel = estoqueAtual; // já consideramos que o que estava baixado pertence à OS
        if (deltaReserva > disponivel) {
          faltantes.push({
            id: pid,
            titulo: tituloMap.get(pid) ?? `Produto #${pid}`,
            disponivel,
            solicitado: deltaReserva,
          });
        }
      }
    });

    if (faltantes.length) {
      return NextResponse.json(
        {
          error: "Estoque insuficiente para um ou mais itens",
          itens: faltantes,
        },
        { status: 409 }
      );
    }

    // --- Aplicação das alterações ---
    // 1) Atualiza tabela osproduto para refletir "desejados"
    //    - remove os que não estão mais presentes
    //    - upsert para os presentes
    const idsParaManter = new Set(desejados.map((d) => d.produtoid));

    // Remover os ausentes (também estornaremos baixa e estoque no passo 2)
    const idsParaRemover = Array.from(atuaisMap.keys()).filter(
      (pid) => !idsParaManter.has(pid)
    );
    if (idsParaRemover.length) {
      const del = await supabase
        .from("osproduto")
        .delete()
        .eq("ordemservicoid", osId)
        .in("produtoid", idsParaRemover);
      if (del.error) throw del.error;
    }

    // Upsert dos desejados (inserir/atualizar linha com preço/subtotal)
    if (desejados.length) {
      const payload = desejados.map((d) => ({
        ordemservicoid: osId,
        produtoid: d.produtoid,
        quantidade: d.quantidade,
        precounitario: d.precounitario,
        subtotal: d.subtotal,
      }));
      const up = await supabase.from("osproduto").upsert(payload, {
        onConflict: "ordemservicoid,produtoid",
        ignoreDuplicates: false,
      });
      if (up.error) throw up.error;
    }

    // 2) Ajusta osproduto_baixa e produto.estoque conforme deltas
    for (const pid of allProdIds) {
      const desejada = desejadosMap.get(pid)?.quantidade ?? 0;
      const baixadaAtual = baixaMap.get(pid) ?? 0;
      const delta = desejada - baixadaAtual; // + => consumir estoque; - => devolver
      if (delta === 0) {
        // Garante que a baixa reflita a desejada (mesmo se 0 -> deletar)
        if (desejada === 0 && baixadaAtual > 0) {
          // remover controle de baixa
          const delBaixa = await supabase
            .from("osproduto_baixa")
            .delete()
            .eq("ordemservicoid", osId)
            .eq("produtoid", pid);
          if (delBaixa.error) throw delBaixa.error;
        } else if (desejada > 0 && baixadaAtual !== desejada) {
          // alinhar exatamente
          const upBaixa = await supabase.from("osproduto_baixa").upsert(
            [{ ordemservicoid: osId, produtoid: pid, quantidade: desejada }],
            { onConflict: "ordemservicoid,produtoid" }
          );
          if (upBaixa.error) throw upBaixa.error;
        }
        continue;
      }

      // Atualiza controle de baixa
      if (desejada === 0) {
        const delBaixa = await supabase
          .from("osproduto_baixa")
          .delete()
          .eq("ordemservicoid", osId)
          .eq("produtoid", pid);
        if (delBaixa.error) throw delBaixa.error;
      } else {
        const upBaixa = await supabase.from("osproduto_baixa").upsert(
          [{ ordemservicoid: osId, produtoid: pid, quantidade: desejada }],
          { onConflict: "ordemservicoid,produtoid" }
        );
        if (upBaixa.error) throw upBaixa.error;
      }

      // Atualiza estoque do produto (set absoluto com base no que lemos)
      const estoqueAtual = estoqueMap.get(pid) ?? 0;
      const novoEstoque = estoqueAtual - delta; // delta>0 consome; delta<0 devolve
      const upEst = await supabase
        .from("produto")
        .update({ estoque: novoEstoque })
        .eq("id", pid);
      if (upEst.error) throw upEst.error;

      // Atualiza cache local p/ próximo loop (evita inconsistências se mesmo id repetir)
      estoqueMap.set(pid, novoEstoque);
      baixaMap.set(pid, desejada);
    }

    // 3) Serviços: estratégia simples — limpar e inserir (não afetam estoque)
    {
      const delS = await supabase
        .from("osservico")
        .delete()
        .eq("ordemservicoid", osId);
      if (delS.error) throw delS.error;

      if (servicosBody.length) {
        const rowsS = servicosBody.map((s) => ({
          ordemservicoid: osId,
          servicoid: toNum(s.servicoid),
          quantidade: Math.max(0, toNum(s.quantidade) || 1),
          precounitario: toNum(s.precounitario ?? 0),
          subtotal:
            s.subtotal !== undefined
              ? toNum(s.subtotal)
              : toNum(s.quantidade) * toNum(s.precounitario),
        }));
        const insS = await supabase.from("osservico").insert(rowsS);
        if (insS.error) throw insS.error;
      }
    }

    // 4) Atualiza total geral da OS
    const totalProdutos = desejados.reduce<number>(
      (acc, p) => acc + (Number(p.subtotal) || 0),
      0
    );
    const totalServicos = servicosBody.reduce<number>(
      (acc, s) =>
        acc +
        (Number(
          s.subtotal !== undefined
            ? s.subtotal
            : toNum(s.quantidade) * toNum(s.precounitario)
        ) || 0),
      0
    );
    const totalGeral = totalProdutos + totalServicos;

    const updOS = await supabase
      .from("ordemservico")
      .update({ orcamentototal: totalGeral })
      .eq("id", osId);
    if (updOS.error) throw updOS.error;

    return NextResponse.json({ ok: true, totalGeral });
  } catch (err: any) {
    console.error("PUT /api/ordens/[id]/orcamento", err);
    return NextResponse.json(
      { error: err?.message || "Falha ao salvar orçamento" },
      { status: 500 }
    );
  }
}
