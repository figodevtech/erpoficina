"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Search, Calendar as CalendarIcon } from "lucide-react";
import type { Pagination } from "../types";
import { Tipo_transacao } from "../types";

interface SearchFilterProps {
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
  dateFrom: string; // "YYYY-MM-DD"
  dateTo: string; // "YYYY-MM-DD"

  search: string;
  setSearch: (value: string) => void;

  setTipo: (value: Tipo_transacao | "") => void;
  tipo: Tipo_transacao | "";

  // ✅ opcionais só para compatibilidade com outros pais
  pagination?: Pagination;
  handleGetTransactions?: (
    pageNumber?: number,
    limit?: number,
    search?: string,
    dateFrom?: string,
    dateTo?: string,
    tipo?: Tipo_transacao | ""
  ) => void | Promise<any>;
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
}: SearchFilterProps) {
  const uid = React.useId();
  const listboxId = `${uid}-tipo-listbox`;

  const [openRange, setOpenRange] = React.useState(false);

  const range: DateRange | undefined = React.useMemo(() => {
    const from = parseYYYYMMDD(dateFrom);
    const to = parseYYYYMMDD(dateTo);
    if (!from && !to) return undefined;
    return { from, to };
  }, [dateFrom, dateTo]);

  const periodLabel = React.useMemo(() => {
    const from = range?.from;
    const to = range?.to;
    if (from && to) return `${format(from, "dd/MM/yyyy")} — ${format(to, "dd/MM/yyyy")}`;
    if (from && !to) return `${format(from, "dd/MM/yyyy")} — ...`;
    return "Período";
  }, [range?.from, range?.to]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
        {/* Buscar */}
        <div className="relative md:col-span-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email ou telefone..."
            className="pl-10 not-dark:bg-white"
          />
        </div>

        {/* Tipo */}
        <div className="md:col-span-3">
          <Select
            value={tipo || ""}
            onValueChange={(value) => {
              if (value === "TODOS") setTipo("");
              else setTipo(value as Tipo_transacao);
            }}
          >
            <SelectTrigger className="w-full hover:cursor-pointer not-dark:bg-white" aria-controls={listboxId}>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent id={listboxId}>
              <SelectItem value="TODOS" className="hover:cursor-pointer">
                Todos
              </SelectItem>
              <SelectItem value={Tipo_transacao.RECEITA} className="hover:cursor-pointer">
                Receitas
              </SelectItem>
              <SelectItem value={Tipo_transacao.DESPESA} className="hover:cursor-pointer">
                Despesas
              </SelectItem>
              <SelectItem value={Tipo_transacao.DEPOSITO} className="hover:cursor-pointer">
                Depósitos
              </SelectItem>
              <SelectItem value={Tipo_transacao.SAQUE} className="hover:cursor-pointer">
                Saques
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Período */}
        <div className="md:col-span-3">
          <Popover open={openRange} onOpenChange={setOpenRange}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-between text-left font-normal not-dark:bg-white",
                  !range?.from && "text-muted-foreground"
                )}
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
                    setDateFrom(toYYYYMMDD(next?.from));
                    setDateTo(toYYYYMMDD(next?.to));
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
                      setDateFrom("");
                      setDateTo("");
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
      </div>
    </div>
  );
}
