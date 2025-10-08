"use client";

import type { RowOS } from "../types";
import { BadgeStatus } from "./badge-status";
import { BadgePrioridade } from "./badge-prioridade";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Car } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TabelaOrdensProps {
  ordens: RowOS[];
  ordemSelecionada?: RowOS | null;
  aoSelecionarOrdem: (ordem: RowOS) => void;
}

export function TabelaOrdens({
  ordens,
  ordemSelecionada,
  aoSelecionarOrdem,
}: TabelaOrdensProps) {
  // ajuste central de “tamanho da linha”
  const CELL_PAD_Y = "py-4";      // px vertical nas células (linhas)
  const HEAD_PAD_Y = "py-3.5";    // px vertical no cabeçalho
  const MAIN_TEXT  = "text-[15px]"; // levemente maior p/ nome do cliente
  const SUB_TEXT   = "text-sm";     // descrição/veículo

  return (
    <div className="space-y-2">
      {/* Desktop: Tabela */}
      <div className="hidden lg:block">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className={cn("w-[90px]", HEAD_PAD_Y)}>OS</TableHead>
                <TableHead className={HEAD_PAD_Y}>Cliente / Veículo</TableHead>
                <TableHead className={cn("w-[42ch]", HEAD_PAD_Y)}>Descrição</TableHead>
                <TableHead className={cn("w-[120px] text-center", HEAD_PAD_Y)}>Prioridade</TableHead>
                <TableHead className={cn("w-[120px] text-center", HEAD_PAD_Y)}>Status</TableHead>
                <TableHead className={cn("w-[120px] text-center", HEAD_PAD_Y)}>Entrada</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {ordens.map((ordem) => {
                const clienteNome = ordem.cliente?.nome ?? "N/A";
                const veiculoStr = ordem.veiculo
                  ? `${ordem.veiculo.marca ?? ""} ${ordem.veiculo.modelo ?? ""} - ${ordem.veiculo.placa ?? ""}`.trim()
                  : "";

                return (
                  <TableRow
                    key={ordem.id}
                    onClick={() => aoSelecionarOrdem(ordem)}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50",
                      ordemSelecionada?.id === ordem.id && "bg-muted"
                    )}
                  >
                    {/* OS */}
                    <TableCell className={cn("font-mono font-medium", CELL_PAD_Y)}>
                      #{ordem.id}
                    </TableCell>

                    {/* Cliente / Veículo */}
                    <TableCell className={cn("min-w-0", CELL_PAD_Y)}>
                      <div className={cn("truncate font-medium", MAIN_TEXT)}>{clienteNome}</div>
                      {veiculoStr && (
                        <div className={cn("mt-0.5 flex items-center gap-1 text-muted-foreground", SUB_TEXT)}>
                          <Car className="h-3 w-3 shrink-0" />
                          <span className="truncate">{veiculoStr}</span>
                        </div>
                      )}
                    </TableCell>

                    {/* Descrição */}
                    <TableCell className={cn("min-w-0", CELL_PAD_Y)}>
                      <div className={cn("truncate text-muted-foreground", SUB_TEXT)}>
                        {ordem.descricao ?? ""}
                      </div>
                    </TableCell>

                    {/* Prioridade */}
                    <TableCell className={cn("text-center", CELL_PAD_Y)}>
                      {ordem.prioridade && (
                        <BadgePrioridade prioridade={ordem.prioridade} />
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className={cn("text-center", CELL_PAD_Y)}>
                      <BadgeStatus status={ordem.status} />
                    </TableCell>

                    {/* Entrada */}
                    <TableCell className={cn("text-center text-muted-foreground", SUB_TEXT, CELL_PAD_Y)}>
                      {ordem.dataEntrada &&
                        formatDistanceToNow(new Date(ordem.dataEntrada), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile/Tablet: Cards */}
      <div className="grid gap-3 lg:hidden">
        {ordens.map((ordem) => {
          const clienteNome = ordem.cliente?.nome ?? "N/A";
          const veiculoStr = ordem.veiculo
            ? `${ordem.veiculo.marca ?? ""} ${ordem.veiculo.modelo ?? ""} - ${ordem.veiculo.placa ?? ""}`.trim()
            : "";

          return (
            <Card
              key={ordem.id}
              className={cn(
                "cursor-pointer p-4 transition-colors hover:bg-muted/50",
                ordemSelecionada?.id === ordem.id && "bg-muted ring-2 ring-primary"
              )}
              onClick={() => aoSelecionarOrdem(ordem)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      OS #{ordem.id}
                    </span>
                    <BadgeStatus status={ordem.status} />
                  </div>

                  <div>
                    <div className={cn("font-medium", MAIN_TEXT)}>{clienteNome}</div>
                    {veiculoStr && (
                      <div className={cn("mt-0.5 flex items-center gap-1 text-muted-foreground", SUB_TEXT)}>
                        <Car className="h-3 w-3 shrink-0" />
                        <span className="truncate">{veiculoStr}</span>
                      </div>
                    )}
                    {ordem.descricao && (
                      <div className={cn("mt-1 text-muted-foreground line-clamp-2", SUB_TEXT)}>
                        {ordem.descricao}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {ordem.prioridade && (
                      <BadgePrioridade prioridade={ordem.prioridade} />
                    )}
                    {ordem.dataEntrada && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(ordem.dataEntrada), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
