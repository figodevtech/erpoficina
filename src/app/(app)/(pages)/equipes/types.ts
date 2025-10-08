export type StatusOS = "TODAS" | "ABERTA" | "EM_ANDAMENTO" | "AGUARDANDO_PECA" | "CONCLUIDA" | "CANCELADA";

export type RowOS = {
  id: number;
  descricao: string | null;
  status: Exclude<StatusOS, "TODAS">;
  dataEntrada: string | null;
  dataSaida: string | null;
  cliente: { id: number; nome: string } | null;
  veiculo: { id: number; placa: string; modelo: string; marca: string } | null;
  setor: { id: number; nome: string } | null;
  prioridade?: "ALTA" | "NORMAL" | "BAIXA" | null;
};

export type DetalheOS = RowOS & {
  observacoes: string | null;
  checklist: {
    id: number;
    item: string;
    status: "OK" | "ALERTA" | "FALHA";
    observacao: string | null;
  }[];
};
