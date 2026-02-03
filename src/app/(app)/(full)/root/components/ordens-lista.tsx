"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Car,
  User,
  Wrench,
  MoreHorizontal,
  ChevronRight,
  Box,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./badge-status";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrdemRoot } from "../types";

interface OrdensListProps {
  ordens: OrdemRoot[];
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
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          Ver todas
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="w-full max-w-full text-xs">
            <TableHeader>
              <TableRow className="border-b border-border/50">
                <TableHead className="px-6 py-3 text-left font-medium text-muted-foreground uppercase tracking-wider">
                  OS / Cliente
                </TableHead>
                <TableHead className="hidden md:table-cell px-6 py-3 text-left font-medium text-muted-foreground uppercase tracking-wider">
                  Veículo
                </TableHead>
                <TableHead className="hidden md:table-cell px-6 py-3 text-left font-medium text-muted-foreground uppercase tracking-wider">
                  Setor / Responsável
                </TableHead>
                <TableHead className="hidden md:table-cell text-center px-6 py-3 font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="hidden md:table-cell px-6 py-3 text-right font-medium text-muted-foreground uppercase tracking-wider">
                  Valor
                </TableHead>
                <TableHead className="hidden md:table-cell px-6 py-3 text-right font-medium text-muted-foreground uppercase tracking-wider">
                  Data
                </TableHead>
                <TableHead className="hidden md:table-cell px-6 py-3 text-right font-medium text-muted-foreground uppercase tracking-wider">
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
                  <TableCell className="max-w-[300px] md:max-w-[400px] truncate py-6 md:py-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 md:p-4 bg-primary/20 rounded-lg md:rounded-xl">
                        <p className="font-bold text-primary">
                          {ordem.numero || `#${ordem.id}`}
                        </p>
                      </div>
                      <div>
                       <StatusBadge className="md:hidden" status={ordem.status} />
                        <div className="flex flex-row items-center gap-1 mt-3 md:mt-0 ">
                          <span>
                            <User className="w-3 h-3" />
                          </span>
                          <p className="text-xs text-muted-foreground flex flex-row items-center gap-1 whitespace-break-spaces md:whitespace-nowrap break-words md:break-normal">
                            {ordem.cliente?.nome || "Cliente não informado"}
                          </p>
                        </div>
                        
                        <div className="flex flex-row items-center gap-1 mt-1">
                          <span>
                            {ordem.veiculo ? (
                              <Car className="w-3 h-3 md:hidden" />
                            ) : ordem.peca ? (
                              <Box className="w-3 h-3 md:hidden" />
                            ) : null}
                          </span>
                          <p className=" md:hidden whitespace-pre-wrap break-words text-xs text-muted-foreground flex flex-row items-center gap-1">
                            {ordem.veiculo ? (
                              <>{ordem.veiculo.placa}</>
                            ) : ordem.peca ? (
                              <>{ordem.peca.titulo.toUpperCase()}</>
                            ) : (
                              "-"
                            )}
                          </p>
                        </div>
                        <div className="md:hidden flex flex-row items-center gap-4 mt-1">
                            <div className="flex flex-row items-center gap-1"><Clock className="w-3 h-3 text-yellow-500"/><span className="">{formatDate(ordem.execucao_inicio_em || undefined)}</span></div>
                            <div className="flex flex-row items-center gap-1"><Clock className="w-3 h-3 text-green-500"/><span className="">{formatDate(ordem.execucao_fim_em || undefined)}</span></div>
                        </div>
                        <p className="pt-2 text-muted-foreground">
                          {"Criado por: " + ordem.responsavel?.nome ||
                            "Usuário indefinido"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:flex min-w-70 flex-row items-center gap-2">
                    <div>
                      {ordem.alvo_tipo === "PECA" ? (
                        <Box className="w-4 h-4" />
                      ) : (
                        <Car className="w-4 h-4" />
                      )}
                    </div>
                    <div className="whitespace-normal break-words text-xs text-foreground">
                      <p className="">
                        {ordem.veiculo?.placa ||
                          ordem.peca?.titulo.toUpperCase() ||
                          "-"}
                      </p>
                      <p className="whitespace-pre-wrap break-words text-[10px] text-muted-foreground">
                        {ordem.veiculo &&
                          `${ordem.veiculo.marca} ${ordem.veiculo.modelo}`}
                        {ordem.peca &&
                          `${ordem.peca.descricao?.toUpperCase() || ""}`}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {ordem.setor?.nome || "-"}
                        </p>
                        <p className=" text-xs text-muted-foreground">
                          {ordem.responsavel?.nome || "-"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-6 py-4 text-center">
                    <StatusBadge status={ordem.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-6 py-4 text-right">
                    <p className="text-xs font-semibold text-foreground">
                      {formatCurrency(ordem.orcamentototal)}
                    </p>
                    {ordem.transacoes && ordem.transacoes.length > 0 && (
                      <p className=" text-success">
                        {formatCurrency(
                          ordem.transacoes
                            .filter((t) => t.tipo === "RECEITA")
                            .reduce((acc, t) => acc + t.valor, 0),
                        )}{" "}
                        pago
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-6 py-4 text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(ordem.execucao_inicio_em || undefined) || ""}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-6 py-4 text-right">
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
