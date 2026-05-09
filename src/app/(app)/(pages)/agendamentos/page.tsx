"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import CustomerSelect from "@/app/(app)/components/customerSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StatusAgendamento } from "@/types/agendamento";
import type { Customer } from "../clientes/types";

type VeiculoOption = { id: number; clienteid: number; placa: string; modelo?: string | null; marca?: string | null };

type AgendamentoItem = {
  id: number;
  clienteid: number;
  veiculoid?: number | null;
  titulo: string;
  descricao?: string | null;
  inicio: string;
  fim?: string | null;
  status: StatusAgendamento;
  cliente?: { id: number; nomerazaosocial: string; telefone?: string | null; email?: string | null } | null;
  veiculo?: { id: number; placa: string; modelo?: string | null; marca?: string | null } | null;
};

type FormState = {
  id?: number;
  clienteid: string;
  veiculoid: string;
  titulo: string;
  descricao: string;
  inicio: string;
  fim: string;
  status: StatusAgendamento;
};

type CalendarView = "MES" | "SEMANA" | "DIA" | "AGENDA";
type AgendamentoConfig = {
  intervalo: number;
  horaInicio: string;
  horaFim: string;
  diasTrabalho: number[];
};

const STATUS_LABEL: Record<StatusAgendamento, string> = {
  AGENDADO: "Agendado",
  CONFIRMADO: "Confirmado",
  EM_ATENDIMENTO: "Em atendimento",
  CONCLUIDO: "Concluido",
  CANCELADO: "Cancelado",
};

const EMPTY_FORM: FormState = {
  clienteid: "",
  veiculoid: "none",
  titulo: "",
  descricao: "",
  inicio: "",
  fim: "",
  status: "AGENDADO",
};

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const VIEW_LABEL: Record<CalendarView, string> = {
  MES: "Mes",
  SEMANA: "Semana",
  DIA: "Dia",
  AGENDA: "Agenda",
};

function formatDateTime(value?: string | Date | null) {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatTime(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMonthTitle(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(value);
}

function formatDateTitle(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(value);
}

function toDateKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthRange(month: Date) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  return {
    start: toDateKey(start),
    end: toDateKey(end),
  };
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + amount);
  return next;
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}

function visibleRange(view: CalendarView, month: Date, selected: Date) {
  if (view === "MES") return monthRange(month);

  if (view === "SEMANA") {
    const start = startOfWeek(selected);
    return { start: toDateKey(start), end: toDateKey(addDays(start, 6)) };
  }

  if (view === "AGENDA") {
    return { start: toDateKey(selected), end: toDateKey(addDays(selected, 30)) };
  }

  return { start: toDateKey(selected), end: toDateKey(selected) };
}

function periodTitle(view: CalendarView, month: Date, selected: Date) {
  if (view === "MES") return formatMonthTitle(month);
  if (view === "DIA") return formatDateTitle(selected);
  if (view === "AGENDA") {
    return `${formatDateTime(selected).split(",")[0]} - ${formatDateTime(addDays(selected, 30)).split(",")[0]}`;
  }

  const start = startOfWeek(selected);
  const end = addDays(start, 6);
  return `${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(start)} - ${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(end)}`;
}

function calendarDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function isSameMonth(date: Date, month: Date) {
  return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
}

function toDateInput(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function toInputFromIso(value?: string | null) {
  return value ? toDateInput(new Date(value)) : "";
}

function addMinutesFromInput(value: string, minutes: number) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() + minutes);
  return toDateInput(date);
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.slice(0, 5).split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(value: number) {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function buildSlots(config: AgendamentoConfig) {
  const start = timeToMinutes(config.horaInicio);
  const end = timeToMinutes(config.horaFim);
  const interval = Math.max(15, config.intervalo);
  const slots: number[] = [];

  for (let value = start; value < end; value += interval) {
    slots.push(value);
  }

  return slots;
}

function getDateFromInput(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function getTimeFromInput(value: string) {
  const date = getDateFromInput(value);
  if (!date) return "";
  return minutesToTime(date.getHours() * 60 + date.getMinutes());
}

function combineDateAndTime(date: Date, time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hour, minute, 0, 0);
  return toDateInput(next);
}

function slotForDate(date: Date, config: AgendamentoConfig) {
  const slots = buildSlots(config);
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  return slots.find((slot) => slot >= currentMinutes) ?? slots[0] ?? timeToMinutes(config.horaInicio);
}

function defaultInicioForDate(dateBase: Date, config: AgendamentoConfig) {
  const date = new Date(dateBase);
  const hasExplicitTime =
    dateBase.getHours() !== 0 ||
    dateBase.getMinutes() !== 0 ||
    dateBase.getSeconds() !== 0 ||
    dateBase.getMilliseconds() !== 0;

  const slot = hasExplicitTime
    ? slotForDate(dateBase, config)
    : toDateKey(dateBase) === toDateKey(new Date())
      ? slotForDate(new Date(), config)
      : buildSlots(config)[0] ?? timeToMinutes(config.horaInicio);

  date.setHours(Math.floor(slot / 60), slot % 60, 0, 0);
  return toDateInput(date);
}

function isPastCalendarDay(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return target < today;
}

function normalizeDiasTrabalho(value: unknown) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.replace(/[{}]/g, "").split(",")
      : [];

  const dias = [...new Set(raw.map(Number).filter((dia) => Number.isInteger(dia) && dia >= 0 && dia <= 6))];
  return dias.length > 0 ? dias.sort((a, b) => a - b) : [1, 2, 3, 4, 5];
}

function isWorkingDay(date: Date, diasTrabalho: number[]) {
  return diasTrabalho.includes(date.getDay());
}

function nextWorkingDay(from: Date, diasTrabalho: number[]) {
  const next = new Date(from);
  next.setHours(0, 0, 0, 0);

  for (let i = 0; i < 14; i++) {
    if (!isPastCalendarDay(next) && isWorkingDay(next, diasTrabalho)) return next;
    next.setDate(next.getDate() + 1);
  }

  return new Date(from);
}

function nextSchedulableDay(from: Date, config: AgendamentoConfig) {
  const next = new Date(from);
  next.setHours(0, 0, 0, 0);
  const now = new Date();
  const slots = buildSlots(config);

  for (let i = 0; i < 30; i++) {
    if (!isPastCalendarDay(next) && isWorkingDay(next, config.diasTrabalho)) {
      const hasFutureSlot = slots.some((slot) => {
        const candidate = new Date(next);
        candidate.setHours(Math.floor(slot / 60), slot % 60, 0, 0);
        return candidate.getTime() >= now.getTime();
      });

      if (hasFutureSlot) return next;
    }

    next.setDate(next.getDate() + 1);
  }

  return nextWorkingDay(from, config.diasTrabalho);
}

function hasFutureConfiguredSlot(date: Date, config: AgendamentoConfig) {
  if (isPastCalendarDay(date) || !isWorkingDay(date, config.diasTrabalho)) return false;

  const now = new Date();
  return buildSlots(config).some((slot) => {
    const candidate = new Date(date);
    candidate.setHours(Math.floor(slot / 60), slot % 60, 0, 0);
    return candidate.getTime() >= now.getTime();
  });
}

function statusBadge(status: StatusAgendamento) {
  if (status === "CANCELADO") return "destructive";
  if (status === "CONCLUIDO") return "secondary";
  if (status === "CONFIRMADO" || status === "EM_ATENDIMENTO") return "default";
  return "outline";
}

export default function AgendamentosPage() {
  const [items, setItems] = useState<AgendamentoItem[]>([]);
  const [veiculos, setVeiculos] = useState<VeiculoOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [agendamentoParaExcluir, setAgendamentoParaExcluir] = useState<AgendamentoItem | null>(null);
  const [agendaConfig, setAgendaConfig] = useState<AgendamentoConfig>({
    intervalo: 60,
    horaInicio: "08:00",
    horaFim: "18:00",
    diasTrabalho: [1, 2, 3, 4, 5],
  });
  const [open, setOpen] = useState(false);
  const [openCustomerSelect, setOpenCustomerSelect] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Customer | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"TODOS" | StatusAgendamento>("TODOS");
  const [draftQ, setDraftQ] = useState("");
  const [draftStatus, setDraftStatus] = useState<"TODOS" | StatusAgendamento>("TODOS");
  const [view, setView] = useState<CalendarView>("SEMANA");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = nextSchedulableDay(new Date(), {
      intervalo: 60,
      horaInicio: "08:00",
      horaFim: "18:00",
      diasTrabalho: [1, 2, 3, 4, 5],
    });
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() =>
    nextSchedulableDay(new Date(), {
      intervalo: 60,
      horaInicio: "08:00",
      horaFim: "18:00",
      diasTrabalho: [1, 2, 3, 4, 5],
    })
  );

  const stats = useMemo(() => {
    return {
      total: items.length,
      confirmados: items.filter((item) => item.status === "CONFIRMADO").length,
      emAtendimento: items.filter((item) => item.status === "EM_ATENDIMENTO").length,
      cancelados: items.filter((item) => item.status === "CANCELADO").length,
    };
  }, [items]);

  const veiculosDoCliente = useMemo(
    () => veiculos.filter((veiculo) => String(veiculo.clienteid) === form.clienteid),
    [form.clienteid, veiculos]
  );

  const days = useMemo(() => calendarDays(currentMonth), [currentMonth]);
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [selectedDate]);
  const slots = useMemo(() => buildSlots(agendaConfig), [agendaConfig]);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, AgendamentoItem[]>();

    for (const item of items) {
      const key = toDateKey(item.inicio);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }

    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());
    }

    return map;
  }, [items]);

  const selectedDayItems = useMemo(
    () => itemsByDay.get(toDateKey(selectedDate)) ?? [],
    [itemsByDay, selectedDate]
  );

  const agendaItems = useMemo(
    () => [...items].sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()),
    [items]
  );

  function isDayUnavailable(date: Date) {
    return isPastCalendarDay(date) || !isWorkingDay(date, agendaConfig.diasTrabalho);
  }

  function isSlotInPast(date: Date, slot: number) {
    const candidate = new Date(date);
    candidate.setHours(Math.floor(slot / 60), slot % 60, 0, 0);
    return candidate.getTime() < Date.now();
  }

  function isSlotOccupied(date: Date, slot: number, ignoreId?: number) {
    return (itemsByDay.get(toDateKey(date)) ?? []).some((item) => {
      if (ignoreId && item.id === ignoreId) return false;
      const inicio = new Date(item.inicio);
      return inicio.getHours() * 60 + inicio.getMinutes() === slot;
    });
  }

  function isSlotUnavailable(date: Date, slot: number, ignoreId?: number) {
    return isDayUnavailable(date) || isSlotInPast(date, slot) || isSlotOccupied(date, slot, ignoreId);
  }

  function weekHasAvailableSlot(date: Date) {
    const start = startOfWeek(date);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index)).some((day) =>
      slots.some((slot) => !isSlotUnavailable(day, slot))
    );
  }

  function firstAvailableSlot(date: Date, preferredSlot?: number, ignoreId?: number) {
    const orderedSlots =
      preferredSlot === undefined
        ? slots
        : [...slots.filter((slot) => slot >= preferredSlot), ...slots.filter((slot) => slot < preferredSlot)];

    return orderedSlots.find((slot) => !isSlotUnavailable(date, slot, ignoreId)) ?? null;
  }

  async function loadLookup() {
    const [lookupResponse, configResponse] = await Promise.all([
      fetch("/api/agendamentos/lookup"),
      fetch("/api/config", { cache: "no-store" }),
    ]);

    const data = await lookupResponse.json();
    if (!lookupResponse.ok) throw new Error(data?.error ?? "Erro ao carregar dados auxiliares");

    const configData = await configResponse.json().catch(() => ({}));
    if (configResponse.ok && configData?.config) {
      const diasTrabalho = normalizeDiasTrabalho(configData.config.agendamento_dias_trabalho);
      setAgendaConfig({
        intervalo: Number(configData.config.agendamento_intervalo_minutos ?? 60),
        horaInicio: String(configData.config.agendamento_hora_inicio ?? "08:00").slice(0, 5),
        horaFim: String(configData.config.agendamento_hora_fim ?? "18:00").slice(0, 5),
        diasTrabalho,
      });

      setSelectedDate((current) => {
        const loadedConfig = {
          intervalo: Number(configData.config.agendamento_intervalo_minutos ?? 60),
          horaInicio: String(configData.config.agendamento_hora_inicio ?? "08:00").slice(0, 5),
          horaFim: String(configData.config.agendamento_hora_fim ?? "18:00").slice(0, 5),
          diasTrabalho,
        };
        if (hasFutureConfiguredSlot(current, loadedConfig)) return current;
        const next = nextSchedulableDay(new Date(), loadedConfig);
        setCurrentMonth(new Date(next.getFullYear(), next.getMonth(), 1));
        return next;
      });
    }

    setVeiculos(data.veiculos ?? []);
  }

  async function loadItems() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: view === "AGENDA" ? "300" : "150",
        status,
        dateFrom: visibleRange(view, currentMonth, selectedDate).start,
        dateTo: visibleRange(view, currentMonth, selectedDate).end,
      });
      if (q.trim()) params.set("q", q.trim());

      const response = await fetch(`/api/agendamentos?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Erro ao carregar agendamentos");
      setItems(data.items ?? []);
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLookup().catch((error) => toast.error(error?.message ?? "Erro ao carregar dados auxiliares"));
  }, []);

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, currentMonth, selectedDate, view]);

  function openCreate(dateBase = selectedDate) {
    if (isDayUnavailable(dateBase)) {
      toast.error("Dia indisponivel para agendamento.");
      return;
    }

    const preferredDate = getDateFromInput(defaultInicioForDate(dateBase, agendaConfig)) ?? dateBase;
    const preferredSlot = preferredDate.getHours() * 60 + preferredDate.getMinutes();
    const availableSlot = firstAvailableSlot(dateBase, preferredSlot);

    if (availableSlot === null) {
      toast.error("Nao ha horarios disponiveis neste dia.");
      return;
    }

    const inicio = combineDateAndTime(dateBase, minutesToTime(availableSlot));

    setForm({
      ...EMPTY_FORM,
      inicio,
      fim: addMinutesFromInput(inicio, agendaConfig.intervalo),
    });
    setClienteSelecionado(null);
    setOpen(true);
  }

  function openEdit(item: AgendamentoItem) {
    const inicio = toInputFromIso(item.inicio);
    const fim = toInputFromIso(item.fim);
    setForm({
      id: item.id,
      clienteid: String(item.clienteid),
      veiculoid: item.veiculoid ? String(item.veiculoid) : "none",
      titulo: item.titulo,
      descricao: item.descricao ?? "",
      inicio,
      fim,
      status: item.status,
    });
    setClienteSelecionado(
      item.cliente
        ? ({
            id: item.cliente.id,
            nomerazaosocial: item.cliente.nomerazaosocial,
            telefone: item.cliente.telefone ?? "",
            email: item.cliente.email ?? "",
          } as Customer)
        : null
    );
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        clienteid: Number(form.clienteid),
        veiculoid: form.veiculoid === "none" ? null : Number(form.veiculoid),
        titulo: form.titulo,
        descricao: form.descricao || null,
        inicio: form.inicio ? new Date(form.inicio).toISOString() : "",
        fim: form.inicio ? new Date(addMinutesFromInput(form.inicio, agendaConfig.intervalo)).toISOString() : null,
        status: form.status,
      };

      const response = await fetch(form.id ? `/api/agendamentos/${form.id}` : "/api/agendamentos", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Erro ao salvar agendamento");

      toast.success(form.id ? "Agendamento atualizado" : "Agendamento criado");
      setOpen(false);
      await loadItems();
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao salvar agendamento");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    setDeleting(true);
    try {
      const response = await fetch(`/api/agendamentos/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Erro ao excluir agendamento");
      toast.success("Agendamento excluido");
      setAgendamentoParaExcluir(null);
      await loadItems();
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao excluir agendamento");
    } finally {
      setDeleting(false);
    }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "clienteid") {
        next.veiculoid = "none";
      }
      if (key === "inicio") {
        next.fim = addMinutesFromInput(String(value), agendaConfig.intervalo);
      }
      return next;
    });
  }

  function setInicioDate(date?: Date) {
    if (!date) return;
    if (isDayUnavailable(date)) {
      toast.error("Dia indisponivel para agendamento.");
      return;
    }

    setForm((current) => {
      const currentTime = getTimeFromInput(current.inicio);
      const preferredSlot = currentTime ? timeToMinutes(currentTime) : undefined;
      const availableSlot = firstAvailableSlot(date, preferredSlot, current.id);

      if (availableSlot === null) {
        toast.error("Nao ha horarios disponiveis neste dia.");
        return current;
      }

      const time = minutesToTime(availableSlot);
      const inicio = combineDateAndTime(date, time);
      return {
        ...current,
        inicio,
        fim: addMinutesFromInput(inicio, agendaConfig.intervalo),
      };
    });
  }

  function setInicioTime(time: string) {
    setForm((current) => {
      const date = getDateFromInput(current.inicio) ?? selectedDate;
      const slot = timeToMinutes(time);

      if (isSlotUnavailable(date, slot, current.id)) {
        toast.error("Horario indisponivel.");
        return current;
      }

      const inicio = combineDateAndTime(date, time);
      return {
        ...current,
        inicio,
        fim: addMinutesFromInput(inicio, agendaConfig.intervalo),
      };
    });
  }

  function goPrevious() {
    if (view === "MES") {
      setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1));
      return;
    }

    setSelectedDate((date) => {
      const next = addDays(date, view === "SEMANA" ? -7 : view === "AGENDA" ? -30 : -1);
      if (view === "SEMANA" && !weekHasAvailableSlot(next)) return date;
      if (view !== "SEMANA" && isDayUnavailable(next)) return date;
      return next;
    });
  }

  function goNext() {
    if (view === "MES") {
      setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1));
      return;
    }

    setSelectedDate((date) => {
      const next = addDays(date, view === "SEMANA" ? 7 : view === "AGENDA" ? 30 : 1);
      if (view === "DIA" && isDayUnavailable(next)) return nextWorkingDay(next, agendaConfig.diasTrabalho);
      return next;
    });
  }

  function goToday() {
    const next = nextWorkingDay(new Date(), agendaConfig.diasTrabalho);
    setCurrentMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    setSelectedDate(next);
  }

  function selectDay(day: Date) {
    setSelectedDate(day);
    if (view === "MES") {
      setCurrentMonth(new Date(day.getFullYear(), day.getMonth(), 1));
    }
  }

  function openFiltros() {
    setDraftQ(q);
    setDraftStatus(status);
    setFiltrosOpen(true);
  }

  function applyFiltros() {
    setQ(draftQ);
    setStatus(draftStatus);
    setFiltrosOpen(false);
  }

  function clearFiltros() {
    setDraftQ("");
    setDraftStatus("TODOS");
    setQ("");
    setStatus("TODOS");
    setFiltrosOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="rounded-lg py-4">
          <CardHeader className="px-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="size-4" />
              Periodo
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 text-2xl font-semibold">{stats.total}</CardContent>
        </Card>
        <Card className="rounded-lg py-4">
          <CardHeader className="px-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="size-4" />
              Confirmados
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 text-2xl font-semibold">{stats.confirmados}</CardContent>
        </Card>
        <Card className="rounded-lg py-4">
          <CardHeader className="px-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="size-4" />
              Em atendimento
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 text-2xl font-semibold">{stats.emAtendimento}</CardContent>
        </Card>
        <Card className="rounded-lg py-4">
          <CardHeader className="px-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <XCircle className="size-4" />
              Cancelados
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 text-2xl font-semibold">{stats.cancelados}</CardContent>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardHeader className="border-b-2 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Agenda</CardTitle>
              <button
                onClick={loadItems}
                className="inline-flex items-center gap-1 text-sm text-foreground/50 hover:text-foreground/70 hover:cursor-pointer"
              >
                <span>Recarregar</span>
                <Loader2 width={12} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Sheet open={filtrosOpen} onOpenChange={setFiltrosOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1" onClick={openFiltros}>
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filtros de agendamentos</SheetTitle>
                  </SheetHeader>
                  <div className="grid flex-1 auto-rows-min gap-6 px-4">
                    <div className="space-y-2">
                      <Label htmlFor="filtro-agendamento-busca">Busca</Label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                          id="filtro-agendamento-busca"
                          className="pl-9"
                          placeholder="Titulo ou cliente"
                          value={draftQ}
                          onChange={(event) => setDraftQ(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") applyFiltros();
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={draftStatus} onValueChange={(value) => setDraftStatus(value as any)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TODOS">Todos os status</SelectItem>
                          {Object.entries(STATUS_LABEL).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mt-2 flex justify-between gap-2">
                      <Button type="button" variant="outline" onClick={clearFiltros}>
                        Limpar filtros
                      </Button>
                      <Button type="button" onClick={applyFiltros}>
                        Aplicar filtros
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              {(q || status !== "TODOS") ? (
                <Badge variant="secondary">
                  {[q ? "Busca ativa" : null, status !== "TODOS" ? STATUS_LABEL[status] : null].filter(Boolean).join(" · ")}
                </Badge>
              ) : null}
              <Button onClick={() => openCreate()}>
                <Plus className="size-4" />
                Novo agendamento
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pt-4 md:px-6">

          <div className={view === "AGENDA" ? "space-y-4" : "grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]"}>
            <div className="overflow-hidden rounded-lg border">
              <div className="flex flex-col gap-3 border-b bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={goPrevious}
                    title="Periodo anterior"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <div className="min-w-[220px] text-center text-sm font-semibold capitalize">
                    {periodTitle(view, currentMonth, selectedDate)}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={goNext}
                    title="Proximo periodo"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Tabs value={view} onValueChange={(value) => setView(value as CalendarView)}>
                    <div className="max-w-full overflow-x-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
                      <TabsList className="h-auto min-w-max justify-start gap-1.5 rounded-2xl border bg-muted/40 p-1 backdrop-blur-sm">
                        {(Object.keys(VIEW_LABEL) as CalendarView[]).map((item) => (
                          <TabsTrigger
                            key={item}
                            value={item}
                            className="h-8 rounded-xl px-3 text-xs font-medium hover:cursor-pointer data-[state=active]:shadow-sm"
                          >
                            {VIEW_LABEL[item]}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                  </Tabs>
                  <Button type="button" variant="outline" onClick={goToday}>
                    Hoje
                  </Button>
                </div>
              </div>

              {view === "MES" ? (
                <>
                  <div className="grid grid-cols-7 border-b bg-muted/20">
                    {WEEK_DAYS.map((day) => (
                      <div key={day} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7">
                    {days.map((day) => {
                      const key = toDateKey(day);
                      const dayItems = itemsByDay.get(key) ?? [];
                      const selected = key === toDateKey(selectedDate);
                      const today = key === toDateKey(new Date());
                      const unavailableDay = isDayUnavailable(day);

                      return (
                        <div
                          key={key}
                          role="button"
                          tabIndex={0}
                          onClick={() => selectDay(day)}
                          onDoubleClick={() => {
                            if (!unavailableDay) openCreate(day);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              selectDay(day);
                            }
                          }}
                          className={[
                            "min-h-[116px] border-b border-r p-2 text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring",
                            !isSameMonth(day, currentMonth) || unavailableDay ? "bg-muted/20 text-muted-foreground" : "bg-background",
                            selected ? "ring-2 ring-inset ring-primary" : "",
                          ].join(" ")}
                        >
                          <div className="mb-2 flex items-center justify-between gap-1">
                            <span
                              className={[
                                "flex size-7 items-center justify-center rounded-full text-xs font-medium",
                                today ? "bg-primary text-primary-foreground" : "",
                              ].join(" ")}
                            >
                              {day.getDate()}
                            </span>
                            {dayItems.length > 0 ? (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                                {dayItems.length}
                              </span>
                            ) : null}
                          </div>
                          <div className="space-y-1">
                            {dayItems.slice(0, 3).map((item) => (
                              <div
                                key={item.id}
                                role="button"
                                tabIndex={0}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openEdit(item);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    openEdit(item);
                                  }
                                }}
                                className="truncate rounded-md border bg-card px-2 py-1 text-[11px] shadow-sm hover:border-primary/50"
                                title={`${formatTime(item.inicio)} - ${item.titulo}`}
                              >
                                <span className="font-medium">{formatTime(item.inicio)}</span>{" "}
                                <span>{item.titulo}</span>
                              </div>
                            ))}
                            {dayItems.length > 3 ? (
                              <div className="px-2 text-[11px] text-muted-foreground">+{dayItems.length - 3} mais</div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}

              {view === "SEMANA" || view === "DIA" ? (
                <div className="overflow-x-auto">
                  <div
                    className="min-w-[760px] grid"
                    style={{ gridTemplateColumns: `72px repeat(${view === "DIA" ? 1 : 7}, minmax(130px, 1fr))` }}
                  >
                    <div className="border-b border-r bg-muted/20 p-2 text-xs font-medium text-muted-foreground">
                      Hora
                    </div>
                    {(view === "DIA" ? [selectedDate] : weekDays).map((day) => {
                      const selected = toDateKey(day) === toDateKey(selectedDate);
                      const unavailableDay = isDayUnavailable(day);
                      return (
                        <button
                          key={toDateKey(day)}
                          type="button"
                          onClick={() => setSelectedDate(day)}
                          className={[
                            "border-b border-r bg-muted/20 p-2 text-center text-xs font-medium hover:bg-muted",
                            selected ? "text-primary" : "text-muted-foreground",
                            unavailableDay ? "bg-muted/40" : "",
                          ].join(" ")}
                        >
                          <div>{WEEK_DAYS[day.getDay()]}</div>
                          <div className="text-sm">{day.getDate()}</div>
                        </button>
                      );
                    })}

                    {slots.map((slot) => (
                      <div key={slot} className="contents">
                        <div className="min-h-[86px] border-b border-r bg-muted/10 p-2 text-xs text-muted-foreground">
                          {minutesToTime(slot)}
                        </div>
                        {(view === "DIA" ? [selectedDate] : weekDays).map((day) => {
                          const slotItems = (itemsByDay.get(toDateKey(day)) ?? []).filter(
                            (item) => {
                              const date = new Date(item.inicio);
                              const minutes = date.getHours() * 60 + date.getMinutes();
                              return minutes >= slot && minutes < slot + agendaConfig.intervalo;
                            }
                          );
                          const unavailableSlot = isSlotUnavailable(day, slot);

                          return (
                            <div
                              key={`${toDateKey(day)}-${slot}`}
                              role="button"
                              tabIndex={0}
                              onDoubleClick={() => {
                                if (unavailableSlot) return;
                                const date = new Date(day);
                                date.setHours(Math.floor(slot / 60), slot % 60, 0, 0);
                                openCreate(date);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  if (unavailableSlot) return;
                                  const date = new Date(day);
                                  date.setHours(Math.floor(slot / 60), slot % 60, 0, 0);
                                  openCreate(date);
                                }
                              }}
                              className={[
                                "min-h-[86px] space-y-1 border-b border-r p-1.5 hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring",
                                unavailableSlot ? "bg-muted/20 opacity-70" : "",
                              ].join(" ")}
                            >
                              {unavailableSlot && slotItems.length === 0 ? (
                                <div className="text-[11px] text-muted-foreground">Indisponivel</div>
                              ) : null}
                              {slotItems.map((item) => (
                                <div
                                  key={item.id}
                                  role="button"
                                  tabIndex={0}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openEdit(item);
                                  }}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      openEdit(item);
                                    }
                                  }}
                                  className="rounded-md border-l-4 border-l-primary bg-primary/10 px-2 py-1 text-xs hover:bg-primary/15"
                                >
                                  <div className="font-medium">{formatTime(item.inicio)} {item.titulo}</div>
                                  <div className="truncate text-muted-foreground">{item.cliente?.nomerazaosocial ?? "-"}</div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {view === "AGENDA" ? (
                <div className="divide-y">
                  {loading ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">Carregando agendamentos...</div>
                  ) : agendaItems.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">Nenhum agendamento no periodo.</div>
                  ) : (
                    agendaItems.map((item) => (
                      <div key={item.id} className="grid gap-3 p-4 md:grid-cols-[180px_1fr_auto] md:items-center">
                        <div>
                          <div className="text-sm font-medium capitalize">{formatDateTime(item.inicio)}</div>
                          <div className="text-xs text-muted-foreground">{item.fim ? `Ate ${formatTime(item.fim)}` : ""}</div>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium">{item.titulo}</div>
                          <div className="truncate text-sm text-muted-foreground">
                            {item.cliente?.nomerazaosocial ?? "-"}
                            {item.veiculo ? ` · ${item.veiculo.placa}` : ""}
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Badge variant={statusBadge(item.status) as any}>{STATUS_LABEL[item.status]}</Badge>
                          <Button size="icon" variant="ghost" onClick={() => openEdit(item)} title="Editar">
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setAgendamentoParaExcluir(item)} title="Excluir">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>

            {view !== "AGENDA" ? (
              <div className="rounded-lg border">
                <div className="flex items-start justify-between gap-3 border-b p-4">
                  <div>
                    <div className="text-sm font-semibold capitalize">{formatDateTitle(selectedDate)}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedDayItems.length} agendamento(s) no dia
                    </div>
                  </div>
                  <Button type="button" size="icon" onClick={() => openCreate(selectedDate)} title="Novo neste dia">
                    <Plus className="size-4" />
                  </Button>
                </div>

                <div className="max-h-[420px] space-y-3 overflow-y-auto p-4">
                  {loading ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">Carregando agendamentos...</div>
                  ) : selectedDayItems.length === 0 ? (
                    <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                      Nenhum agendamento para este dia.
                    </div>
                  ) : (
                    selectedDayItems.map((item) => (
                      <div key={item.id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold">{item.titulo}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatTime(item.inicio)}
                              {item.fim ? ` - ${formatTime(item.fim)}` : ""}
                            </div>
                          </div>
                          <Badge variant={statusBadge(item.status) as any}>{STATUS_LABEL[item.status]}</Badge>
                        </div>

                        <div className="mt-3 space-y-1 text-xs">
                          <div className="font-medium">{item.cliente?.nomerazaosocial ?? "-"}</div>
                          {item.veiculo ? (
                            <div className="text-muted-foreground">
                              {item.veiculo.placa} - {item.veiculo.marca ?? ""} {item.veiculo.modelo ?? ""}
                            </div>
                          ) : null}
                          {item.descricao ? <div className="text-muted-foreground">{item.descricao}</div> : null}
                        </div>

                        <div className="mt-3 flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(item)} title="Editar">
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setAgendamentoParaExcluir(item)} title="Excluir">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar agendamento" : "Novo agendamento"}</DialogTitle>
            <DialogDescription>Preencha os dados do atendimento agendado.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  {clienteSelecionado ? (
                    <>
                      <div className="truncate text-sm font-medium">{clienteSelecionado.nomerazaosocial}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {[clienteSelecionado.telefone, clienteSelecionado.email].filter(Boolean).join(" · ")}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Nenhum cliente selecionado</div>
                  )}
                </div>
                <div className="flex gap-2">
                  {clienteSelecionado ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setClienteSelecionado(null);
                        setField("clienteid", "");
                      }}
                      title="Remover cliente"
                    >
                      <X className="size-4" />
                    </Button>
                  ) : null}
                  <CustomerSelect
                    open={openCustomerSelect}
                    setOpen={setOpenCustomerSelect}
                    OnSelect={(cliente) => {
                      setClienteSelecionado(cliente ?? null);
                      setField("clienteid", cliente ? String(cliente.id) : "");
                      setVeiculos((cliente?.veiculos ?? []) as VeiculoOption[]);
                    }}
                  >
                    <Button type="button" variant="outline">
                      <Search className="size-4" />
                      Selecionar cliente
                    </Button>
                  </CustomerSelect>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Titulo</Label>
                <Input value={form.titulo} onChange={(event) => setField("titulo", event.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Veiculo</Label>
                <Select value={form.veiculoid} onValueChange={(value) => setField("veiculoid", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem veiculo</SelectItem>
                    {veiculosDoCliente.map((veiculo) => (
                      <SelectItem key={veiculo.id} value={String(veiculo.id)}>
                        {veiculo.placa} - {veiculo.marca} {veiculo.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-start">
                      <CalendarDays className="size-4" />
                      {form.inicio ? formatDateTime(form.inicio).split(",")[0] : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={getDateFromInput(form.inicio)}
                      onSelect={setInicioDate}
                      disabled={isDayUnavailable}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Horario</Label>
                <Select value={getTimeFromInput(form.inicio)} onValueChange={setInicioTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar horario" />
                  </SelectTrigger>
                  <SelectContent>
                  {slots.map((slot) => (
                    <SelectItem
                      key={slot}
                      value={minutesToTime(slot)}
                      disabled={isSlotUnavailable(getDateFromInput(form.inicio) ?? selectedDate, slot, form.id)}
                    >
                      {minutesToTime(slot)}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => setField("status", value as StatusAgendamento)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea value={form.descricao} onChange={(event) => setField("descricao", event.target.value)} />
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={saving || !form.clienteid || !form.titulo || !form.inicio}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!agendamentoParaExcluir}
        onOpenChange={(open) => {
          if (!open && !deleting) setAgendamentoParaExcluir(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao remove o agendamento
              {agendamentoParaExcluir?.titulo ? ` "${agendamentoParaExcluir.titulo}"` : ""}. Essa operacao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                if (agendamentoParaExcluir) void remove(agendamentoParaExcluir.id);
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
