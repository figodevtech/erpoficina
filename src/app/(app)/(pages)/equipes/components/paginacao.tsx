"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  itensPorPagina: number;
  totalItens: number;
  aoMudarPagina: (pagina: number) => void;
  aoMudarItensPorPagina: (itens: number) => void;
}

export function Paginacao({
  paginaAtual,
  totalPaginas,
  itensPorPagina,
  totalItens,
  aoMudarPagina,
  aoMudarItensPorPagina,
}: PaginacaoProps) {
  const inicio = (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(paginaAtual * itensPorPagina, totalItens);

  return (
    <div className="flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row ">
      {/* Info e Seletor de Itens por Página */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          Mostrando {inicio} a {fim} de {totalItens}
        </span>
      </div>

      {/* Controles de Navegação */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          onClick={() => aoMudarPagina(1)}
          disabled={paginaAtual === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          onClick={() => aoMudarPagina(paginaAtual - 1)}
          disabled={paginaAtual === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 px-2">
          <span className="text-sm font-medium">{paginaAtual}</span>
          <span className="text-sm text-muted-foreground">de</span>
          <span className="text-sm font-medium">{totalPaginas}</span>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          onClick={() => aoMudarPagina(paginaAtual + 1)}
          disabled={paginaAtual === totalPaginas}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          onClick={() => aoMudarPagina(totalPaginas)}
          disabled={paginaAtual === totalPaginas}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">Itens por página:</span>
        <Select value={itensPorPagina.toString()} onValueChange={(v) => aoMudarItensPorPagina(Number(v))}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="30">30</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
