import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ModoBaixaEstoqueOS = "ORCAMENTO" | "EXECUCAO";

export type EstoqueInsuficienteOSItem = {
  id: number;
  titulo: string;
  disponivel: number;
  solicitado: number;
};

export async function buscarModoBaixaEstoqueOS(): Promise<ModoBaixaEstoqueOS> {
  const { data, error } = await supabaseAdmin
    .from("config_geral")
    .select("modo_baixa_estoque_os")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === "42703") return "ORCAMENTO";
    throw error;
  }

  return data?.modo_baixa_estoque_os === "EXECUCAO" ? "EXECUCAO" : "ORCAMENTO";
}

export async function validarEstoqueParaBaixaOS(osId: number): Promise<EstoqueInsuficienteOSItem[]> {
  const [{ data: produtos, error: produtosError }, { data: baixas, error: baixasError }] = await Promise.all([
    supabaseAdmin
      .from("osproduto")
      .select("produtoid, quantidade, produto:produtoid ( titulo, descricao, estoque )")
      .eq("ordemservicoid", osId),
    supabaseAdmin
      .from("osproduto_baixa")
      .select("produtoid, quantidade")
      .eq("ordemservicoid", osId),
  ]);

  if (produtosError) throw produtosError;
  if (baixasError) throw baixasError;

  const baixasMap = new Map<number, number>();
  for (const baixa of baixas ?? []) {
    baixasMap.set(Number(baixa.produtoid), Number(baixa.quantidade ?? 0));
  }

  const faltantes: EstoqueInsuficienteOSItem[] = [];

  for (const item of produtos ?? []) {
    const produtoId = Number(item.produtoid);
    const quantidade = Number(item.quantidade ?? 0);
    const baixada = baixasMap.get(produtoId) ?? 0;
    const delta = quantidade - baixada;

    if (delta <= 0) continue;

    const produto = Array.isArray((item as any).produto) ? (item as any).produto[0] : (item as any).produto;
    const disponivel = Number(produto?.estoque ?? 0);

    if (delta > disponivel) {
      faltantes.push({
        id: produtoId,
        titulo: String(produto?.titulo ?? produto?.descricao ?? `Produto #${produtoId}`),
        disponivel,
        solicitado: delta,
      });
    }
  }

  return faltantes;
}

export function mensagemEstoqueInsuficienteOS(itens: EstoqueInsuficienteOSItem[]) {
  if (itens.length === 1) {
    const item = itens[0];
    return `Estoque insuficiente para ${item.titulo}. Disponivel: ${item.disponivel}; necessario: ${item.solicitado}.`;
  }

  return `Estoque insuficiente para ${itens.length} produtos da OS.`;
}

export async function consumirEstoqueOS(osId: number) {
  const faltantes = await validarEstoqueParaBaixaOS(osId);
  if (faltantes.length > 0) {
    return { ok: false as const, faltantes };
  }

  const { error } = await supabaseAdmin.rpc("consumir_estoque_os", {
    p_os_id: osId,
  });

  if (error) {
    const missingFunction =
      error.code === "PGRST202" || error.message?.includes("consumir_estoque_os");

    if (!missingFunction) throw error;

    const fallback = await supabaseAdmin.rpc("reaplicar_baixa_estoque_os", {
      p_os_id: osId,
    });

    if (fallback.error) throw fallback.error;
  }

  return { ok: true as const };
}
