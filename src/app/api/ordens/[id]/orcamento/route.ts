// src/app/api/ordens/[id]/orcamento/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// GET: retorna os itens (produtos/serviços) do orçamento da OS
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // <- params agora é Promise
    const osId = Number(id);
    if (!osId || Number.isNaN(osId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Produtos
    const { data: prodRows, error: prodErr } = await supabase
      .from("osproduto")
      .select(`
        ordemservicoid,
        produtoid,
        quantidade,
        precounitario,
        subtotal,
        produto:produtoid (descricao)
      `)
      .eq("ordemservicoid", osId);
    if (prodErr) throw prodErr;

    const produtos = (prodRows ?? []).map((r: any) => ({
      produtoid: toNum(r.produtoid),
      descricao: String(r.produto?.descricao ?? ""),
      quantidade: toNum(r.quantidade ?? 1),
      precounitario: toNum(r.precounitario ?? 0),
      subtotal: toNum(r.subtotal ?? 0),
    }));

    // Serviços
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
    return NextResponse.json({ error: "Falha ao carregar orçamento" }, { status: 500 });
  }
}

// PUT: salva os itens do orçamento
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // <- assinatura nova
) {
  try {
    const { id } = await ctx.params; // <- await nos params
    const osId = Number(id);
    if (!osId || Number.isNaN(osId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const produtos = Array.isArray(body?.produtos) ? body.produtos : [];
    const servicos = Array.isArray(body?.servicos) ? body.servicos : [];

    // limpa e reinsere
    const del1 = await supabase.from("osproduto").delete().eq("ordemservicoid", osId);
    if (del1.error) throw del1.error;

    const del2 = await supabase.from("osservico").delete().eq("ordemservicoid", osId);
    if (del2.error) throw del2.error;

    if (produtos.length) {
      const rowsP = produtos.map((p: any) => ({
        ordemservicoid: osId,
        produtoid: toNum(p.produtoid),
        quantidade: toNum(p.quantidade ?? 1),
        precounitario: toNum(p.precounitario ?? 0),
        subtotal: toNum(p.subtotal ?? toNum(p.quantidade ?? 1) * toNum(p.precounitario ?? 0)),
      }));
      const ins1 = await supabase.from("osproduto").insert(rowsP);
      if (ins1.error) throw ins1.error;
    }

    if (servicos.length) {
      const rowsS = servicos.map((s: any) => ({
        ordemservicoid: osId,
        servicoid: toNum(s.servicoid),
        quantidade: toNum(s.quantidade ?? 1),
        precounitario: toNum(s.precounitario ?? 0),
        subtotal: toNum(s.subtotal ?? toNum(s.quantidade ?? 1) * toNum(s.precounitario ?? 0)),
      }));
      const ins2 = await supabase.from("osservico").insert(rowsS);
      if (ins2.error) throw ins2.error;
    }

    const totalProdutos = produtos.reduce(
      (acc: number, p: any) => acc + toNum(p.subtotal ?? toNum(p.quantidade ?? 1) * toNum(p.precounitario ?? 0)),
      0
    );
    const totalServicos = servicos.reduce(
      (acc: number, s: any) => acc + toNum(s.subtotal ?? toNum(s.quantidade ?? 1) * toNum(s.precounitario ?? 0)),
      0
    );
    const totalGeral = totalProdutos + totalServicos;

    const upd = await supabase.from("ordemservico").update({ orcamentototal: totalGeral }).eq("id", osId);
    if (upd.error) throw upd.error;

    return NextResponse.json({ ok: true, totalGeral });
  } catch (err: any) {
    console.error("PUT /api/ordens/[id]/orcamento", err);
    return NextResponse.json({ error: err?.message || "Falha ao salvar orçamento" }, { status: 500 });
  }
}
