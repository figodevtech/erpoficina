// src/app/api/ordens/[id]/orcamento/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// GET: retorna os itens (produtos/serviços) do orçamento da OS
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

    // Produtos da OS
    const { data: prodRows, error: prodErr } = await supabase
      .from("osproduto")
      .select("ordemservicoid, produtoid, quantidade, precounitario, subtotal, produto:produtoid (codigo, descricao)")
      .eq("ordemservicoid", osId);
    if (prodErr) throw prodErr;

    const produtos = (prodRows ?? []).map((r: any) => ({
      produtoid: r.produtoid,
      codigo: r.produto?.codigo ?? null,
      descricao: r.produto?.descricao ?? "",
      quantidade: Number(r.quantidade || 1),
      precounitario: Number(r.precounitario || 0),
      subtotal: Number(r.subtotal || 0),
    }));

    // Serviços da OS
    const { data: servRows, error: servErr } = await supabase
      .from("osservico")
      .select("ordemservicoid, servicoid, quantidade, precounitario, subtotal, servico:servicoid (codigo, descricao)")
      .eq("ordemservicoid", osId);
    if (servErr) throw servErr;

    const servicos = (servRows ?? []).map((r: any) => ({
      servicoid: r.servicoid,
      codigo: r.servico?.codigo ?? null,
      descricao: r.servico?.descricao ?? "",
      quantidade: Number(r.quantidade || 1),
      precounitario: Number(r.precounitario || 0),
      subtotal: Number(r.subtotal || 0),
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

// PUT: salva itens (produtos/serviços) do orçamento da OS
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const osId = Number(id);
    if (!osId || Number.isNaN(osId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const produtos: Array<{ produtoid: number; quantidade: number; precounitario: number; subtotal: number }> =
      Array.isArray(body?.produtos) ? body.produtos : [];
    const servicos: Array<{ servicoid: number; quantidade: number; precounitario: number; subtotal: number }> =
      Array.isArray(body?.servicos) ? body.servicos : [];

    // Transação "manual": limpa e insere novamente
    const del1 = await supabase.from("osproduto").delete().eq("ordemservicoid", osId);
    if (del1.error) throw del1.error;
    const del2 = await supabase.from("osservico").delete().eq("ordemservicoid", osId);
    if (del2.error) throw del2.error;

    if (produtos.length) {
      const ins1 = await supabase.from("osproduto").insert(
        produtos.map((p) => ({
          ordemservicoid: osId,
          produtoid: p.produtoid,
          quantidade: Number(p.quantidade || 1),
          precounitario: Number(p.precounitario || 0),
          subtotal: Number(p.subtotal || 0),
        }))
      );
      if (ins1.error) throw ins1.error;
    }

    if (servicos.length) {
      const ins2 = await supabase.from("osservico").insert(
        servicos.map((s) => ({
          ordemservicoid: osId,
          servicoid: s.servicoid,
          quantidade: Number(s.quantidade || 1),
          precounitario: Number(s.precounitario || 0),
          subtotal: Number(s.subtotal || 0),
        }))
      );
      if (ins2.error) throw ins2.error;
    }

    const totalGeral =
      produtos.reduce((acc, p) => acc + Number(p.subtotal || 0), 0) +
      servicos.reduce((acc, s) => acc + Number(s.subtotal || 0), 0);

    // opcional: guarda um espelho do total na OS
    const upd = await supabase
      .from("ordemservico")
      .update({ orcamentototal: totalGeral })
      .eq("id", osId);
    if (upd.error) throw upd.error;

    return NextResponse.json({ ok: true, totalGeral });
  } catch (err: any) {
    console.error("PUT /api/ordens/[id]/orcamento", err);
    return NextResponse.json({ error: "Falha ao salvar orçamento" }, { status: 500 });
  }
}
