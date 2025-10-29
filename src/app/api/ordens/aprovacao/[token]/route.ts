export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");

// Carrega tudo que a página pública precisa, sem relações aninhadas profundas
async function carregarPorToken(token: string) {
  const tok = await supabase
    .from("osaprovacao")
    .select("id, ordemservicoid, token, expira_em, usado_em, created_at")
    .eq("token", token)
    .maybeSingle();
  if (tok.error) throw tok.error;
  if (!tok.data) return null;

  const osId = tok.data.ordemservicoid as number | null;

  if (!osId) {
    return {
      tokenRow: tok.data,
      ordemservicoid: null,
      cliente: null,
      produtos: [],
      servicos: [],
      totais: { totalProdutos: 0, totalServicos: 0, totalGeral: 0 },
      statusOS: "ORCAMENTO",
      statusAprovacao: "PENDENTE",
    };
  }

  const os = await supabase
    .from("ordemservico")
    .select("id, clienteid, status, statusaprovacao")
    .eq("id", osId)
    .maybeSingle();
  if (os.error) throw os.error;

  const cliId = os.data?.clienteid as number | undefined;

  let cliente: { nomerazaosocial: string; cpfcnpj: string } | null = null;
  if (cliId) {
    const c = await supabase
      .from("cliente")
      .select("nomerazaosocial, cpfcnpj")
      .eq("id", cliId)
      .maybeSingle();
    if (c.error) throw c.error;
    if (c.data) cliente = { nomerazaosocial: c.data.nomerazaosocial, cpfcnpj: c.data.cpfcnpj };
  }

  const p = await supabase
    .from("osproduto")
    .select("produtoid, quantidade, precounitario, subtotal, produto:produtoid(titulo, descricao)")
    .eq("ordemservicoid", osId);
  if (p.error) throw p.error;
  const produtos = (p.data || []).map((row: any) => ({
    descricao: row.produto?.descricao || row.produto?.titulo || "Produto",
    quantidade: Number(row.quantidade || 0),
    precounitario: Number(row.precounitario || 0),
    subtotal: Number(row.subtotal || 0),
  }));

  const s = await supabase
    .from("osservico")
    .select("servicoid, quantidade, precounitario, subtotal, servico:servicoid(descricao)")
    .eq("ordemservicoid", osId);
  if (s.error) throw s.error;
  const servicos = (s.data || []).map((row: any) => ({
    descricao: row.servico?.descricao || "Serviço",
    quantidade: Number(row.quantidade || 0),
    precounitario: Number(row.precounitario || 0),
    subtotal: Number(row.subtotal || 0),
  }));

  const totalProdutos = produtos.reduce((acc, it) => acc + Number(it.subtotal || 0), 0);
  const totalServicos = servicos.reduce((acc, it) => acc + Number(it.subtotal || 0), 0);

  return {
    tokenRow: tok.data,
    ordemservicoid: osId,
    cliente,
    produtos,
    servicos,
    totais: {
      totalProdutos,
      totalServicos,
      totalGeral: totalProdutos + totalServicos,
    },
    statusOS: os.data?.status || "ORCAMENTO",
    statusAprovacao: os.data?.statusaprovacao || "PENDENTE",
  };
}

export async function GET(request: Request, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params;
    const url = new URL(request.url);
    const doc = onlyDigits(url.searchParams.get("doc") || "");

    const bundle = await carregarPorToken(token);
    if (!bundle) return NextResponse.json({ error: "Token inválido" }, { status: 404 });

    const { tokenRow, cliente } = bundle;

    // expirado
    if (tokenRow.expira_em && new Date(tokenRow.expira_em).getTime() < Date.now()) {
      return NextResponse.json({ error: "Link expirado", expirado: true }, { status: 410 });
    }
    // já usado
    if (tokenRow.usado_em) {
      return NextResponse.json({ error: "Link já utilizado", usado: true }, { status: 409 });
    }

    if (doc) {
      const ok = !!cliente && onlyDigits(cliente.cpfcnpj) === doc;
      return NextResponse.json({ ...bundle, acessoLiberado: ok });
    }

    return NextResponse.json({ ...bundle, acessoLiberado: false });
  } catch (e: any) {
    console.error("GET /api/ordens/aprovacao/[token]", e);
    return NextResponse.json({ error: "Falha ao carregar" }, { status: 500 });
  }
}

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

    const { tokenRow, cliente, ordemservicoid } = bundle;
    if (!ordemservicoid) return NextResponse.json({ error: "OS não encontrada" }, { status: 404 });

    // expirado/usado?
    if (tokenRow.expira_em && new Date(tokenRow.expira_em).getTime() < Date.now()) {
      return NextResponse.json({ error: "Link expirado" }, { status: 410 });
    }
    if (tokenRow.usado_em) {
      return NextResponse.json({ error: "Link já utilizado" }, { status: 409 });
    }

    // valida doc do cliente
    const docOk = !!cliente && onlyDigits(cliente.cpfcnpj) === doc;
    if (!docOk) {
      return NextResponse.json({ error: "Documento não confere" }, { status: 401 });
    }

    // Se aprovar: statusaprovacao = APROVADO, status = ORCAMENTO_APROVADO
    // Se reprovar: statusaprovacao = RECUSADO, status = ORCAMENTO (permanece em orçamento)
    const novoStatusAprov: "APROVADO" | "RECUSADO" = acao === "aprovar" ? "APROVADO" : "RECUSADO";
    const novoStatusOS = acao === "aprovar" ? "ORCAMENTO_APROVADO" : "ORCAMENTO";

    // marca token como usado
    const updTok = await supabase
      .from("osaprovacao")
      .update({ usado_em: new Date().toISOString() })
      .eq("id", tokenRow.id);
    if (updTok.error) throw updTok.error;

    // atualiza status da OS + statusaprovacao
    const updOS = await supabase
      .from("ordemservico")
      .update({ status: novoStatusOS, statusaprovacao: novoStatusAprov })
      .eq("id", ordemservicoid);
    if (updOS.error) throw updOS.error;

    return NextResponse.json({ ok: true, status: novoStatusOS, statusaprovacao: novoStatusAprov });
  } catch (e: any) {
    console.error("POST /api/ordens/aprovacao/[token]", e);
    return NextResponse.json({ error: "Falha ao processar" }, { status: 500 });
  }
}
