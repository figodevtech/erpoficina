// ./src/app/(app)/(pages)/ordens/components/ordens-filtros.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { SlidersHorizontal, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PrioFiltro } from "./ordens-tabela-helpers";

type FilterSheetProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  prioFiltro: PrioFiltro;
  setPrioFiltro: (v: PrioFiltro) => void;
  dataInicio?: Date;
  dataFim?: Date;
  onSetInicio: (d?: Date) => void;
  onSetFim: (d?: Date) => void;
  onLimpar: () => void;
};

export function OrdensFilterSheet({
  open,
  onOpenChange,
  prioFiltro,
  setPrioFiltro,
  dataInicio,
  dataFim,
  onSetInicio,
  onSetFim,
  onLimpar,
}: FilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 hover:cursor-pointer">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtros da listagem</SheetTitle>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          {/* Prioridade */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Prioridade</label>
            <Select value={prioFiltro} onValueChange={(v) => setPrioFiltro(v as PrioFiltro)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas</SelectItem>
                <SelectItem value="ALTA">Alta</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="BAIXA">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Datas */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Data de entrada (intervalo)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Data início */}
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">Início</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataInicio && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInicio ? dataInicio.toLocaleDateString("pt-BR") : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dataInicio} onSelect={onSetInicio} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Data fim */}
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">Fim</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !dataFim && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataFim ? dataFim.toLocaleDateString("pt-BR") : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dataFim} onSelect={onSetFim} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div className="mt-2 flex justify-between gap-2">
            <Button variant="outline" className="w-30" size="default" type="button" onClick={onLimpar}>
              Limpar
            </Button>
            <Button size="default" className="w-30" type="button" onClick={() => onOpenChange(false)}>
              Aplicar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
