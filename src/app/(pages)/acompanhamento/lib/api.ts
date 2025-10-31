export type QuadItem = {
  id: number;
  descricao: string | null;
  status: string | null;
  prioridade?: "BAIXA" | "NORMAL" | "ALTA" | null;
  alvoTipo?: "VEICULO" | "PECA" | null;
  dataEntrada: string | null;
  dataSaida: string | null;
  cliente?: { id: number; nome: string } | null;
  setor?: { id: number; nome: string } | null;
  veiculo?: { id: number; modelo: string; placa: string; marca?: string | null; cor?: string | null } | null;
  peca?: { id: number; titulo: string; descricao?: string | null } | null;
};

function mapItem(r: any): QuadItem {
  return {
    id: r?.id,
    descricao: r?.descricao ?? null,
    status: r?.status ?? null,
    prioridade: r?.prioridade ?? null,
    alvoTipo: r?.alvo_tipo ?? null,
    dataEntrada: r?.dataentrada ?? null,
    dataSaida: r?.datasaida ?? null,
    cliente: r?.cliente ? { id: r.cliente.id, nome: r.cliente.nomerazaosocial } : null,
    setor: r?.setor ? { id: r.setor.id, nome: r.setor.nome } : null,
    veiculo: r?.veiculo
      ? {
          id: r.veiculo.id,
          modelo: r.veiculo.modelo,
          placa: r.veiculo.placa,
          marca: r.veiculo.marca ?? null,
          cor: r.veiculo.cor ?? null,
        }
      : null,
    peca: r?.peca ? { id: r.peca.id, titulo: r.peca.titulo, descricao: r.peca.descricao ?? null } : null,
  };
}

export async function listarQuadro(params?: { finalizadas?: "hoje" | "recentes"; horasRecentes?: number }) {
  const u = new URL("/api/acompanhamento/ordens", window.location.origin);
  if (params?.finalizadas) u.searchParams.set("finalizadas", params.finalizadas);
  if (params?.horasRecentes) u.searchParams.set("horasRecentes", String(params.horasRecentes));

  const r = await fetch(u.toString(), { cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Falha ao carregar quadro");

  return {
    aguardando: Array.isArray(j.aguardando) ? j.aguardando.map(mapItem) : [],
    emAndamento: Array.isArray(j.emAndamento) ? j.emAndamento.map(mapItem) : [],
    aguardandoPagamento: Array.isArray(j.aguardandoPagamento) ? j.aguardandoPagamento.map(mapItem) : [],
    concluidasRecentes: Array.isArray(j.concluidasRecentes) ? j.concluidasRecentes.map(mapItem) : [],
    meta: j?.meta ?? null,
  };
}
