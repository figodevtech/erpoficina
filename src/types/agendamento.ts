export type StatusAgendamento =
  | "PENDENTE_APROVACAO"
  | "AGENDADO"
  | "RECUSADO"
  | "CANCELADO";

export type OrigemAgendamento = "ERP" | "SITE";

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
  origem?: OrigemAgendamento | null;
  motivorecusa?: string | null;
  mensagemnotificacao?: string | null;
  canalnotificacao?: string | null;
  notificadoat?: string | null;
  decisaoat?: string | null;
  decisorusuarioid?: string | null;
  createdat?: string | null;
  updatedat?: string | null;
}
