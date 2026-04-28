"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { ChevronDown, ExternalLink, ShoppingCart } from "lucide-react";
import { Produto } from "../../../types";
import Link from "next/link";
import formatarEmReal from "@/utils/formatarEmReal";
import { formatDate } from "@/utils/formatDate";

export function TabVendas({ produto }: { produto: Produto }) {
  const vendas = (produto as any).vendasdoproduto ?? [];

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge variant="outline">Desconhecido</Badge>;
    const upper = status.toUpperCase();
    const formatted = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, " ");

    switch (upper) {
      case "CONCLUIDA":
      case "CONCLUÍDA":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">Concluída</Badge>;
      case "PENDENTE":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">Pendente</Badge>;
      case "CANCELADA":
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{formatted}</Badge>;
    }
  };

  return (
    <TabsContent value="Vendas" className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-2 py-3 md:px-6 md:py-6 space-y-6">
      
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Vendas Realizadas
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Histórico de vendas diretas onde este produto foi comercializado.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-background px-3 py-1.5 border shadow-sm">
            <span className="text-xs font-medium text-muted-foreground">Total:</span>
            <span className="text-sm font-bold">{vendas.length}</span>
          </div>
        </div>

        <div className="rounded-md border bg-card overflow-hidden">
          <Table className="text-xs">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor Venda</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendas.length > 0 ? (
                vendas.map((v: any, idx: number) => {
                  const venda = v.venda || {};
                  const clienteNome = venda.cliente?.nomerazaosocial || "Não informado";

                  return (
                    <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium text-muted-foreground">#{v.venda_id}</TableCell>
                      <TableCell>{formatDate(venda.datavenda || venda.createdat)}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={clienteNome}>{clienteNome}</TableCell>
                      <TableCell className="font-medium">{v.quantidade}</TableCell>
                      <TableCell>{getStatusBadge(venda.status)}</TableCell>
                      <TableCell className="text-right font-medium">{formatarEmReal(v.valor_total || venda.valortotal)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer rounded-full">
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <Button variant="ghost" asChild className="w-full justify-start cursor-pointer px-2 text-xs">
                              <Link href={`/historicovendas?id=${v.venda_id}`}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Ver Venda
                              </Link>
                            </Button>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell className="text-center h-24 text-muted-foreground" colSpan={7}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingCart className="h-8 w-8 opacity-20" />
                      <p>Produto não possui histórico de vendas diretas</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </TabsContent>
  );
}
