import type { StatusAgendamento } from "@/types/agendamento";

export const AGENDAMENTO_STATUS: StatusAgendamento[] = [
  "PENDENTE_APROVACAO",
  "AGENDADO",
  "RECUSADO",
  "CANCELADO",
];

export const AGENDAMENTO_STATUS_SET = new Set<StatusAgendamento>(AGENDAMENTO_STATUS);
const AGENDAMENTO_TIME_ZONE = "America/Fortaleza";

export function asStatusAgendamento(value: unknown, fallback: StatusAgendamento = "AGENDADO") {
  const status = String(value ?? fallback).toUpperCase() as StatusAgendamento;
  return AGENDAMENTO_STATUS_SET.has(status) ? status : fallback;
}

export function onlyDigits(value?: string | null) {
  return (value ?? "").replace(/\D+/g, "");
}

export function formatAgendamentoMessage(params: {
  status: "APROVADO" | "RECUSADO";
  clienteNome?: string | null;
  inicio?: string | null;
  motivo?: string | null;
}) {
  const nome = params.clienteNome?.trim() || "cliente";
  const quando = params.inicio
    ? new Intl.DateTimeFormat("pt-BR", {
        timeZone: AGENDAMENTO_TIME_ZONE,
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(params.inicio))
    : "";

  if (params.status === "APROVADO") {
    return `Olá, ${nome}. Seu agendamento${quando ? ` para ${quando}` : ""} foi aprovado. Aguardamos você.`;
  }

  const motivo = params.motivo?.trim();
  return `Olá, ${nome}. Seu agendamento${quando ? ` para ${quando}` : ""} foi recusado.${motivo ? ` Motivo: ${motivo}.` : ""}`;
}

export function buildWhatsappUrl(telefone?: string | null, message?: string | null) {
  const digits = onlyDigits(telefone);
  if (!digits || !message) return null;
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`;
}
