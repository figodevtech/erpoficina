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
import { Skeleton } from "@/components/ui/skeleton";
import TableSkeleton from "../../../components/table-skeleton"; 

interface TabelaOrdensProps {
  ordens: RowOS[];
  carregando?: boolean;              
  ordemSelecionada?: RowOS | null;
  aoSelecionarOrdem: (ordem: RowOS) => void;
}

export function TabelaOrdens({
  ordens,
  carregando = false,              
  ordemSelecionada,
  aoSelecionarOrdem,
}: TabelaOrdensProps) {
  const CELL_PAD_Y = "py-4";
  const HEAD_PAD_Y = "py-3.5";
  const MAIN_TEXT  = "text-[15px]";
  const SUB_TEXT   = "text-sm";

  return (
    <div>
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
              {carregando ? (
                <TableSkeleton
                  rows={8}
                  columns={[
                    { cellClass: "py-4", barClass: "h-4 w-12" },                 
                    { cellClass: "py-4", barClass: "h-4 w-2/3" },                 
                    { cellClass: "py-4", barClass: "h-4 w-3/4" },               
                    { cellClass: "py-4 text-center", barClass: "h-6 w-20 rounded-full" }, 
                    { cellClass: "py-4 text-center", barClass: "h-6 w-24 rounded-full" }, 
                    { cellClass: "py-4 text-center", barClass: "h-4 w-16" }, 
                  ]}
                />
              ) : (
                ordens.map((ordem) => {
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
                      <TableCell className={cn("font-mono font-medium", CELL_PAD_Y)}>
                        #{ordem.id}
                      </TableCell>

                      <TableCell className={cn("min-w-0", CELL_PAD_Y)}>
                        <div className={cn("truncate font-medium", MAIN_TEXT)}>{clienteNome}</div>
                        {veiculoStr && (
                          <div className={cn("mt-0.5 flex items-center gap-1 text-muted-foreground", SUB_TEXT)}>
                            <Car className="h-3 w-3 shrink-0" />
                            <span className="truncate">{veiculoStr}</span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className={cn("min-w-0", CELL_PAD_Y)}>
                        <div className={cn("truncate text-muted-foreground", SUB_TEXT)}>
                          {ordem.descricao ?? ""}
                        </div>
                      </TableCell>

                      <TableCell className={cn("text-center", CELL_PAD_Y)}>
                        {ordem.prioridade && <BadgePrioridade prioridade={ordem.prioridade} />}
                      </TableCell>

                      <TableCell className={cn("text-center", CELL_PAD_Y)}>
                        <BadgeStatus status={ordem.status} />
                      </TableCell>

                      <TableCell className={cn("text-center text-muted-foreground", SUB_TEXT, CELL_PAD_Y)}>
                        {ordem.dataEntrada &&
                          formatDistanceToNow(new Date(ordem.dataEntrada), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile/Tablet: Cards */}
      <div className="grid gap-3 lg:hidden">
        {carregando
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={`sk-m-${i}`} className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="mb-2 h-4 w-2/3" />
                <Skeleton className="mb-2 h-3 w-1/2" />
                <Skeleton className="h-3 w-5/6" />
                <div className="mt-3 flex items-center gap-2">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </Card>
            ))
          : ordens.map((ordem) => {
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
                        <span className="font-mono text-sm font-medium">OS #{ordem.id}</span>
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
                        {ordem.prioridade && <BadgePrioridade prioridade={ordem.prioridade} />}
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
