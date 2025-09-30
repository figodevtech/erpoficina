export type QuadItem = {
  id: number;
  descricao: string | null;
  status: "ABERTA" | "EM_ANDAMENTO" | "AGUARDANDO_PECA" | "AGUARDANDO_PAGAMENTO" | "CONCLUIDA" | "CANCELADA";
  dataEntrada: string | null;
  dataSaidaReal: string | null;
  updatedAt: string | null;
  cliente?: { id: number; nome: string } | null;
  veiculo?: { id: number; placa: string; modelo: string; marca: string } | null;
  setor?: { id: number; nome: string } | null;
  pagamentos?: { id: number; status: string }[] | null;
};

/** Converte o payload do servidor (snake_case / nomerazaosocial) para o formato do UI */
function mapItem(s: any): QuadItem {
  return {
    id: s.id,
    descricao: s.descricao ?? null,
    status: s.status,
    dataEntrada: s.dataentrada ?? s.dataEntrada ?? null,
    dataSaidaReal: s.datasaidareal ?? s.dataSaidaReal ?? null,
    updatedAt: s.updatedat ?? s.updatedAt ?? null,
    cliente: s.cliente
      ? { id: s.cliente.id, nome: s.cliente.nomerazaosocial ?? s.cliente.nome ?? "—" }
      : null,
    veiculo: s.veiculo
      ? { id: s.veiculo.id, placa: s.veiculo.placa, modelo: s.veiculo.modelo, marca: s.veiculo.marca }
      : null,
    setor: s.setor ? { id: s.setor.id, nome: s.setor.nome } : null,
    pagamentos: s.pagamentos ?? null,
  };
}

/**
 * Lista dados do quadro (aguardando, em atendimento, aguardando pagamento, finalizadas).
 * - finalizadas: "hoje" → apenas concluídas do dia (America/Fortaleza)
 * - finalizadas: "recentes" → janela de horas (horasRecentes, padrão 12h)
 */
export async function listarQuadro(params?: {
  horasRecentes?: number;
  finalizadas?: "hoje" | "recentes";
}) {
  const url = new URL("/api/acompanhamento/ordens", window.location.origin);
  if (params?.horasRecentes) url.searchParams.set("horasRecentes", String(params.horasRecentes));
  if (params?.finalizadas) url.searchParams.set("finalizadas", params.finalizadas);

  const r = await fetch(url.toString(), { cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Falha ao carregar quadro");

  return {
    aguardando: Array.isArray(j.aguardando) ? j.aguardando.map(mapItem) : [],
    emAndamento: Array.isArray(j.emAndamento) ? j.emAndamento.map(mapItem) : [],
    aguardandoPagamento: Array.isArray(j.aguardandoPagamento) ? j.aguardandoPagamento.map(mapItem) : [],
    concluidasRecentes: Array.isArray(j.concluidasRecentes) ? j.concluidasRecentes.map(mapItem) : [],
    meta: j.meta ?? {},
  };
}

/** Lista setores (para filtros/indicadores, caso queira usar no board). */
export async function listarSetores(): Promise<{ id: number; nome: string }[]> {
  const r = await fetch("/api/setores", { cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  return Array.isArray(j) ? j : (j?.items ?? []);
}
