"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, SlidersHorizontal } from "lucide-react";
import type { Pagination } from "../types";
import { Tipo_transacao } from "../types";

type FluxoViewMode = "TODAS" | "A_RECEBER" | "A_PAGAR";

interface SearchFilterProps {
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
  dateFrom: string;
  dateTo: string;
  search: string;
  setSearch: (value: string) => void;
  setTipo: (value: Tipo_transacao | "") => void;
  tipo: Tipo_transacao | "";
  viewMode: FluxoViewMode;
  setViewMode: (value: FluxoViewMode) => void;
  pagination?: Pagination;
  handleGetTransactions?: (
    pageNumber?: number,
    limit?: number,
    search?: string,
    dateFrom?: string,
    dateTo?: string,
    tipo?: Tipo_transacao | "",
    pendente?: boolean | ""
  ) => void | Promise<any>;
  disableTipo?: boolean;
  lockedTipoLabel?: string;
  renderOnlyTrigger?: boolean;
}

function parseYYYYMMDD(v: string): Date | undefined {
  if (!v) return undefined;
  const d = new Date(`${v}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function toYYYYMMDD(d?: Date): string {
  return d ? format(d, "yyyy-MM-dd") : "";
}

export default function SearchFilter({
  setSearch,
  search,
  setTipo,
  tipo,
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
  viewMode,
  setViewMode,
  disableTipo = false,
  lockedTipoLabel,
  renderOnlyTrigger = false,
}: SearchFilterProps) {
  const uid = React.useId();
  const listboxId = `${uid}-tipo-listbox`;
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [openRange, setOpenRange] = React.useState(false);
  const [draftSearch, setDraftSearch] = React.useState(search);
  const [draftTipo, setDraftTipo] = React.useState<Tipo_transacao | "">(tipo);
  const [draftDateFrom, setDraftDateFrom] = React.useState(dateFrom);
  const [draftDateTo, setDraftDateTo] = React.useState(dateTo);
  const [draftViewMode, setDraftViewMode] = React.useState<FluxoViewMode>(viewMode);

  React.useEffect(() => {
    if (!sheetOpen) {
      setDraftSearch(search);
      setDraftTipo(tipo);
      setDraftDateFrom(dateFrom);
      setDraftDateTo(dateTo);
      setDraftViewMode(viewMode);
    }
  }, [sheetOpen, search, tipo, dateFrom, dateTo, viewMode]);

  const range: DateRange | undefined = React.useMemo(() => {
    const from = parseYYYYMMDD(draftDateFrom);
    const to = parseYYYYMMDD(draftDateTo);
    if (!from && !to) return undefined;
    return { from, to };
  }, [draftDateFrom, draftDateTo]);

  const activeCount = [
    search.trim(),
    tipo,
    dateFrom,
    dateTo,
    viewMode !== "TODAS" ? viewMode : "",
  ].filter(Boolean).length;

  const periodLabel = React.useMemo(() => {
    const from = range?.from;
    const to = range?.to;
    if (from && to) return `${format(from, "dd/MM/yyyy")} - ${format(to, "dd/MM/yyyy")}`;
    if (from && !to) return `${format(from, "dd/MM/yyyy")} - ...`;
    return "Periodo";
  }, [range?.from, range?.to]);

  const applyFilters = () => {
    setSearch(draftSearch);
    setTipo(disableTipo ? "" : draftTipo);
    setDateFrom(draftDateFrom);
    setDateTo(draftDateTo);
    setViewMode(draftViewMode);
    setSheetOpen(false);
  };

  const clearFilters = () => {
    setDraftSearch("");
    setDraftTipo("");
    setDraftDateFrom("");
    setDraftDateTo("");
    setDraftViewMode("TODAS");
    setSearch("");
    setTipo("");
    setDateFrom("");
    setDateTo("");
    setViewMode("TODAS");
  };

  return (
    <div className={renderOnlyTrigger ? "" : "w-full"}>
      <div className="flex items-center gap-2">
        {activeCount > 0 && (
          <Button variant="ghost" className="hover:cursor-pointer" onClick={clearFilters}>
            Limpar filtros
          </Button>
        )}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 hover:cursor-pointer">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {activeCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                  {activeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Filtros do fluxo de caixa</SheetTitle>
            </SheetHeader>

            <div className="grid gap-6 px-4 py-4">
              <div className="space-y-2">
                <Label>Lançamentos Futuros</Label>
                <Tabs value={draftViewMode} onValueChange={(value) => setDraftViewMode(value as FluxoViewMode)}>
                  <TabsList className="grid w-full grid-cols-1 h-auto sm:grid-cols-3">
                    <TabsTrigger value="TODAS">Todas</TabsTrigger>
                    <TabsTrigger value="A_RECEBER">A receber</TabsTrigger>
                    <TabsTrigger value="A_PAGAR">A pagar</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fluxo-search">Busca</Label>
                <Input
                  id="fluxo-search"
                  value={draftSearch}
                  onChange={(e) => setDraftSearch(e.target.value)}
                  placeholder="Buscar na descricao"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  disabled={disableTipo || draftViewMode !== "TODAS"}
                  value={draftTipo || ""}
                  onValueChange={(value) => {
                    if (value === "TODOS") setDraftTipo("");
                    else setDraftTipo(value as Tipo_transacao);
                  }}
                >
                  <SelectTrigger className="w-full" aria-controls={listboxId}>
                    <SelectValue
                      placeholder={
                        draftViewMode !== "TODAS"
                          ? lockedTipoLabel || "Tipo definido pela visualizacao"
                          : "Todos"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent id={listboxId}>
                    <SelectItem value="TODOS">Todos</SelectItem>
                    <SelectItem value={Tipo_transacao.RECEITA}>Receitas</SelectItem>
                    <SelectItem value={Tipo_transacao.DESPESA}>Despesas</SelectItem>
                    <SelectItem value={Tipo_transacao.DEPOSITO}>Depositos</SelectItem>
                    <SelectItem value={Tipo_transacao.SAQUE}>Saques</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Periodo</Label>
                <Popover open={openRange} onOpenChange={setOpenRange}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("w-full justify-between text-left font-normal", !range?.from && "text-muted-foreground")}
                    >
                      <span className="truncate">{periodLabel}</span>
                      <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-70" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3">
                      <Calendar
                        mode="range"
                        numberOfMonths={2}
                        selected={range}
                        onSelect={(next) => {
                          setDraftDateFrom(toYYYYMMDD(next?.from));
                          setDraftDateTo(toYYYYMMDD(next?.to));
                        }}
                        locale={ptBR}
                        initialFocus
                      />

                      <div className="mt-3 flex w-full gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="flex-1"
                          onClick={() => {
                            setDraftDateFrom("");
                            setDraftDateTo("");
                          }}
                        >
                          Limpar
                        </Button>

                        <Button
                          type="button"
                          className="flex-1"
                          onClick={() => setOpenRange(false)}
                          disabled={!range?.from || !range?.to}
                        >
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={clearFilters}>
                  Limpar
                </Button>
                <Button type="button" className="flex-1" onClick={applyFilters}>
                  Aplicar
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
