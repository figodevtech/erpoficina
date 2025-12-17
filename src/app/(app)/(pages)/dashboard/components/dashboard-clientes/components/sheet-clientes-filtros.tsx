"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { Calendar as CalendarIcon, SlidersHorizontal } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { formatarDataCurta } from "../lib/date";

type Props = {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  dataInicio: Date | null;
  dataFim: Date | null;
  aoMudarDataInicio: (data?: Date) => void;
  aoMudarDataFim: (data?: Date) => void;
  aoLimpar: () => void;
};

export default function SheetClientesFiltros({
  aberto,
  aoMudarAberto,
  dataInicio,
  dataFim,
  aoMudarDataInicio,
  aoMudarDataFim,
  aoLimpar,
}: Props) {
  return (
    <Sheet open={aberto} onOpenChange={aoMudarAberto}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 hover:cursor-pointer">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtros de clientes</SheetTitle>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Intervalo de datas</p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 space-y-1">
                <p className="text-[11px] text-muted-foreground">Data inicial</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-9 w-full justify-start text-left text-xs font-normal",
                        !dataInicio && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1.5 h-4 w-4" />
                      {dataInicio ? formatarDataCurta(dataInicio) : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataInicio ?? undefined}
                      onSelect={aoMudarDataInicio}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-[11px] text-muted-foreground">Data final</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-9 w-full justify-start text-left text-xs font-normal",
                        !dataFim && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1.5 h-4 w-4" />
                      {dataFim ? formatarDataCurta(dataFim) : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataFim ?? undefined}
                      onSelect={aoMudarDataFim}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div className="mt-2 flex justify-between gap-2">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={aoLimpar}>
              Limpar filtros
            </Button>
            <SheetClose asChild>
              <Button type="button" className="w-full sm:w-auto">
                Aplicar filtros
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
