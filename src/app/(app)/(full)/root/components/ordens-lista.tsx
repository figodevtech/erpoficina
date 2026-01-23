"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, User, Wrench, MoreHorizontal, ChevronRight, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ordem } from "@/app/(app)/(pages)/ordens/types";
import { OrdemServico } from "@/types/ordemservico";
import { StatusBadge } from "./badge-status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OrdensListProps {
  ordens: Ordem[];
}

function formatDate(dateString?: Date) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function OrdensList({ ordens }: OrdensListProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-semibold">
          Últimas Ordens de Serviço
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          Ver todas
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="w-full text-xs">
            <TableHeader>
              <TableRow className="border-b border-border/50">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  OS / Cliente
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Veículo
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Setor / Responsável
                </TableHead>
                <TableHead className="text-center px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Valor
                </TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Data
                </TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/30">
              {ordens.map((ordem) => (
                <TableRow
                  key={ordem.id}
                  className="hover:bg-secondary/30 transition-colors cursor-pointer group"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-4 bg-primary/20 rounded-xl">

                      <p className="font-bold text-primary">
                          {ordem.numero || `#${ordem.id}`}
                      </p>
                      </div>
                      <div>
                        
                        <p className="text-sm text-muted-foreground flex flex-row items-center gap-1">
                          <User className="w-3 h-3"/>{ordem.cliente?.nome || "Cliente não informado"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {"Criado por: " + ordem.responsavel?.nome || "Cliente não informado"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                    <TableCell className="min-w-70 flex flex-row items-center gap-2">
                      <div>
                      {ordem.alvo_tipo === "PECA" ? (<Box className="w-4 h-4"/>): (<Car className="w-4 h-4"/>)}
                      </div>
                    <div className="whitespace-normal break-words text-sm text-foreground">
                        <p className="text-xs">
                          {ordem.veiculo?.placa || ordem.peca?.titulo.toUpperCase() || "-"}
                        </p>
                        <p className="whitespace-pre-wrap break-words text-[10px] text-muted-foreground">
                          {ordem.veiculo &&
                             `${ordem.veiculo.marca} ${ordem.veiculo.modelo}`
                          }
                          {ordem.peca &&
                            `${ordem.peca.descricao?.toUpperCase() || ""}`
                          }
                        </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {ordem.setor?.nome || "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ordem.responsavel?.nome || "-"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <StatusBadge status={ordem.status} />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(ordem.orcamentototal)}
                    </p>
                    {ordem.transacoes && ordem.transacoes.length > 0 && (
                      <p className="text-xs text-success">
                        {formatCurrency(
                          ordem.transacoes
                            .filter((t) => t.tipo === "RECEITA")
                            .reduce((acc, t) => acc + t.valor, 0)
                        )}{" "}
                        pago
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(ordem.created_at) || ""}
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Imprimir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
