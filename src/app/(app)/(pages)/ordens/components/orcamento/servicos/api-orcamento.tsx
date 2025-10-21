// src/app/(app)/(pages)/ordens/components/orcamento/servicos/api-orcamento.ts
import { ItemProduto, ItemServico, ProdutoBusca, ServicoBusca } from "../tipos";

const toNum = (v: any) => (v === null || v === undefined || isNaN(+v) ? 0 : +v);

export async function buscarProdutosAPI(params: { q?: string; codigo?: string }) {
  const url = new URL("/api/produtos/buscar", window.location.origin);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.codigo) url.searchParams.set("codigo", params.codigo);
  const r = await fetch(url.toString(), { cache: "no-store" });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Erro ao buscar produtos");

  const arr = Array.isArray(j?.produtos) ? j.produtos : Array.isArray(j?.items) ? j.items : [];
  const produtos: ProdutoBusca[] = arr.map((p: any) => ({
    id: Number(p.id),
    // suporta tanto "codigo" quanto "referencia" vindos do backend
    codigo: String(p.codigo ?? p.referencia ?? ""),
    descricao: String(p.descricao ?? p.titulo ?? ""),
    // suporta "precounitario" ou "precovenda"
    precounitario: toNum(p.precounitario ?? p.precovenda ?? 0),
    estoque: toNum(p.estoque ?? 0),
  }));
  return produtos;
}

export async function buscarServicosAPI(params: { q?: string; codigo?: string }) {
  const url = new URL("/api/servicos/buscar", window.location.origin);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.codigo) url.searchParams.set("codigo", params.codigo);
  const r = await fetch(url.toString(), { cache: "no-store" });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Erro ao buscar serviços");

  const arr = Array.isArray(j?.servicos) ? j.servicos : Array.isArray(j?.items) ? j.items : [];
  const servicos: ServicoBusca[] = arr.map((s: any) => ({
    id: Number(s.id),
    codigo: String(s.codigo ?? ""),
    descricao: String(s.descricao ?? ""),
    precohora: toNum(s.precohora ?? 0),
  }));
  return servicos;
}

export async function carregarItensDaOSAPI(osId: number) {
  const r = await fetch(`/api/ordens/${osId}/orcamento`, { cache: "no-store" });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Falha ao carregar orçamento");

  const produtos: ItemProduto[] = (j?.produtos ?? []).map((p: any) => ({
    produtoid: Number(p.produtoid),
    descricao: String(p.descricao ?? ""),
    quantidade: toNum(p.quantidade || 1),
    precounitario: toNum(p.precounitario || 0),
    subtotal: toNum(p.subtotal || (p.quantidade || 1) * (p.precounitario || 0)),
  }));

  const servicos: ItemServico[] = (j?.servicos ?? []).map((s: any) => ({
    servicoid: Number(s.servicoid),
    descricao: String(s.descricao ?? ""),
    quantidade: toNum(s.quantidade || 1),
    precounitario: toNum(s.precounitario || 0),
    subtotal: toNum(s.subtotal || (s.quantidade || 1) * (s.precounitario || 0)),
  }));

  return { produtos, servicos };
}

export async function salvarOrcamentoAPI(osId: number, itensProduto: ItemProduto[], itensServico: ItemServico[]) {
  const body = {
    produtos: itensProduto.map((p) => ({
      produtoid: p.produtoid,
      quantidade: p.quantidade,
      precounitario: p.precounitario,
      subtotal: p.subtotal,
    })),
    servicos: itensServico.map((s) => ({
      servicoid: s.servicoid,
      quantidade: s.quantidade,
      precounitario: s.precounitario,
      subtotal: s.subtotal,
    })),
  };
  const r = await fetch(`/api/ordens/${osId}/orcamento`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Falha ao salvar orçamento");
  return j as { ok: true; totalGeral: number };
}
