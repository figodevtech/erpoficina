export type StatusAgendamento =
  | "AGENDADO"
  | "CONFIRMADO"
  | "EM_ATENDIMENTO"
  | "CONCLUIDO"
  | "CANCELADO";

export interface Agendamento {
  id: number;
  clienteid: number;
  veiculoid?: number | null;
  usuarioid?: string | null;
  titulo: string;
  descricao?: string | null;
  inicio: string;
  fim?: string | null;
  status: StatusAgendamento;
  createdat?: string | null;
  updatedat?: string | null;
}
