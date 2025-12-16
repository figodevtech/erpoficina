// src/app/acompanhamento/lib/api.ts

export type OsProdutoItem = {
  quantidade: number | null;
  precounitario: number | null;
  subtotal: number | null;
  produto: { id: number; titulo: string } | null;
};

export type OsServicoItem = {
  quantidade: number | null;
  precounitario: number | null;
  subtotal: number | null;
  servico: { id: number; descricao: string } | null;

  // NOVO
  realizador: { id: string; nome: string } | null;
};

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

  veiculo?: {
    id: number;
    modelo: string;
    placa: string;
    marca?: string | null;
    cor?: string | null;
  } | null;

  peca?: { id: number; titulo: string; descricao?: string | null } | null;

  // Itens do orçamento
  produtos?: OsProdutoItem[];
  servicos?: OsServicoItem[];
};

export type SetorItem = {
  id: number;
  nome: string;
  descricao?: string | null;
  responsavel?: string | null;
  ativo: boolean;
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

    produtos: Array.isArray(r?.produtos)
      ? r.produtos.map((p: any) => ({
          quantidade: typeof p?.quantidade === "number" ? p.quantidade : null,
          precounitario: typeof p?.precounitario === "number" ? p.precounitario : null,
          subtotal: typeof p?.subtotal === "number" ? p.subtotal : null,
          produto: p?.produto ? { id: p.produto.id, titulo: p.produto.titulo } : null,
        }))
      : [],

    servicos: Array.isArray(r?.servicos)
      ? r.servicos.map((s: any) => ({
          quantidade: typeof s?.quantidade === "number" ? s.quantidade : null,
          precounitario: typeof s?.precounitario === "number" ? s.precounitario : null,
          subtotal: typeof s?.subtotal === "number" ? s.subtotal : null,
          servico: s?.servico ? { id: s.servico.id, descricao: s.servico.descricao } : null,

          // NOVO
          realizador: s?.realizador ? { id: s.realizador.id, nome: s.realizador.nome } : null,
        }))
      : [],
  };
}

export async function listarSetoresAtivos(): Promise<SetorItem[]> {
  const u = new URL("/api/tipos/setores", window.location.origin);

  const r = await fetch(u.toString(), { cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Falha ao listar setores");

  const items = Array.isArray(j?.items) ? (j.items as SetorItem[]) : [];
  return items.filter((x) => x?.ativo === true);
}

export type ListarQuadroParams = {
  finalizadas?: "hoje" | "recentes";
  horasRecentes?: number;
  setorId?: number;
};

export async function listarQuadro(params?: ListarQuadroParams) {
  const u = new URL("/api/acompanhamento/ordens", window.location.origin);

  if (params?.finalizadas) u.searchParams.set("finalizadas", params.finalizadas);
  if (params?.horasRecentes) u.searchParams.set("horasRecentes", String(params.horasRecentes));
  if (typeof params?.setorId === "number") u.searchParams.set("setorId", String(params.setorId));

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
