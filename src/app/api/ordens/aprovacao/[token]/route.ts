// /src/app/api/ordens/aprovacao/[token]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server role
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const onlyDigits = (v: string) => (v || "").replace(/\D+/g, "");
const toNum = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);

async function carregarPorToken(token: string) {
  const tok = await supabase
    .from("osaprovacao")
    .select("id, ordemservicoid, usado_em")
    .eq("token", token)
    .maybeSingle();
  if (tok.error || !tok.data) return null;

  const osId = tok.data.ordemservicoid;

  const os = await supabase
    .from("ordemservico")
    .select("id, status, statusaprovacao, clienteid")
    .eq("id", osId)
    .maybeSingle();
  if (os.error || !os.data) return null;

  const cli = await supabase
    .from("cliente")
    .select("id, nomerazaosocial, cpfcnpj")
    .eq("id", os.data.clienteid)
    .maybeSingle();
  if (cli.error || !cli.data) return null;

  const prods = await supabase
    .from("osproduto")
    .select("quantidade, precounitario, subtotal, produto:produtoid (descricao)")
    .eq("ordemservicoid", osId);

  const servs = await supabase
    .from("osservico")
    .select("quantidade, precounitario, subtotal, servico:servicoid (descricao)")
    .eq("ordemservicoid", osId);

  const produtos = (prods.data || []).map((r: any) => ({
    descricao: r.produto?.descricao || "Produto",
    quantidade: toNum(r.quantidade ?? 0),
    precounitario: toNum(r.precounitario ?? 0),
    subtotal: toNum(r.subtotal ?? 0),
  }));

  const servicos = (servs.data || []).map((r: any) => ({
    descricao: r.servico?.descricao || "Serviço",
    quantidade: toNum(r.quantidade ?? 0),
    precounitario: toNum(r.precounitario ?? 0),
    subtotal: toNum(r.subtotal ?? 0),
  }));

  const totalProdutos = produtos.reduce<number>((acc, it) => acc + (Number(it.subtotal) || 0), 0);
  const totalServicos = servicos.reduce<number>((acc, it) => acc + (Number(it.subtotal) || 0), 0);

  return {
    tokenRow: tok.data,
    ordemservicoid: osId,
    cliente: cli.data,
    produtos,
    servicos,
    totais: {
      totalProdutos,
      totalServicos,
      totalGeral: totalProdutos + totalServicos,
    },
    statusOS: os.data.status || "ORCAMENTO",
    statusAprovacao: os.data.statusaprovacao || "PENDENTE",
  };
}

// GET: dados para a página pública. Só libera ação quando doc confere.
// Não expira por tempo — só “expira” quando usado_em é preenchido.
export async function GET(request: Request, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params;
    const url = new URL(request.url);
    const doc = onlyDigits(url.searchParams.get("doc") || "");

    const bundle = await carregarPorToken(token);
    if (!bundle) return NextResponse.json({ error: "Token inválido" }, { status: 404 });

    const { tokenRow, cliente } = bundle;

    if (tokenRow.usado_em) {
      return NextResponse.json({ ...bundle, acessoLiberado: false, jaRespondido: true });
    }

    const acessoLiberado = !!doc && onlyDigits(cliente.cpfcnpj) === doc;
    return NextResponse.json({ ...bundle, acessoLiberado, jaRespondido: false });
  } catch (e: any) {
    console.error("GET /api/ordens/aprovacao/[token]", e);
    return NextResponse.json({ error: "Falha ao carregar" }, { status: 500 });
  }
}

/**
 * POST: aprovar/reprovar orçamento.
 * - Aprovar  => statusaprovacao: APROVADA,   status: ORCAMENTO_APROVADO
 * - Reprovar => statusaprovacao: REPROVADA,  status: ORCAMENTO_RECUSADO
 * - **Não** devolve mais estoque em reprovar (só no cancelamento da OS).
 * - Idempotente: se token já usado e estados batem, retorna { ok: true, reused: true }.
 */
export async function POST(request: Request, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    const acao = String(body?.acao || "");
    const doc = onlyDigits(String(body?.doc || ""));

    if (!["aprovar", "reprovar"].includes(acao)) {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }
    if (!doc) {
      return NextResponse.json({ error: "Documento obrigatório" }, { status: 400 });
    }

    const bundle = await carregarPorToken(token);
    if (!bundle) return NextResponse.json({ error: "Token inválido" }, { status: 404 });

    const { tokenRow, cliente, ordemservicoid, statusAprovacao, statusOS } = bundle;

    // valida doc
    if (onlyDigits(cliente.cpfcnpj) !== doc) {
      return NextResponse.json({ error: "Documento não confere" }, { status: 401 });
    }

    const desiredAprov = acao === "aprovar" ? "APROVADA" : "REPROVADA";
    const desiredOS = acao === "aprovar" ? "ORCAMENTO_APROVADO" : "ORCAMENTO_RECUSADO";

    // idempotência
    if (tokenRow.usado_em) {
      const jaOk =
        (acao === "aprovar" && statusAprovacao === "APROVADA" && statusOS === "ORCAMENTO_APROVADO") ||
        (acao === "reprovar" && statusAprovacao === "REPROVADA" && statusOS === "ORCAMENTO_RECUSADO");
      if (jaOk) return NextResponse.json({ ok: true, reused: true });
      return NextResponse.json({ error: "Link já utilizado" }, { status: 409 });
    }

    // 1) statusaprovacao
    {
      const upd = await supabase
        .from("ordemservico")
        .update({ statusaprovacao: desiredAprov })
        .eq("id", ordemservicoid);
      if (upd.error) throw upd.error;
    }

    // 2) status da OS
    {
      const upd = await supabase
        .from("ordemservico")
        .update({ status: desiredOS })
        .eq("id", ordemservicoid);
      if (upd.error) throw upd.error;
    }

    // 3) NÃO devolvemos estoque aqui ao reprovar.
    // (A devolução acontecerá se/quando a OS for CANCELADA ou EXCLUÍDA.)

    // 4) marca token como usado
    {
      const mark = await supabase
        .from("osaprovacao")
        .update({ usado_em: new Date().toISOString() })
        .eq("id", tokenRow.id)
        .is("usado_em", null);
      if (mark.error) throw mark.error;
    }

    return NextResponse.json({ ok: true, statusAprovacao: desiredAprov, statusOS: desiredOS });
  } catch (e: any) {
    console.error("POST /api/ordens/aprovacao/[token]", e);
    return NextResponse.json({ error: e?.message || "Falha ao processar resposta" }, { status: 500 });
  }
}
