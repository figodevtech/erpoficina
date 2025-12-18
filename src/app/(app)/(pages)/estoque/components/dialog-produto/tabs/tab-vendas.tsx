"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { ChevronDown, Edit } from "lucide-react";
import { Produto } from "../../../types";
import { formatDate } from "@/utils/formatDate";
import formatarEmReal from "@/utils/formatarEmReal";

export function TabVendas({ produto }: { produto: Produto }) {
  const vendas = (produto as any).vendasdoproduto ?? [];
  return (
    <TabsContent value="Vendas" className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
      <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
        <div className="flex flex-row items-center justify-between">
          <span className="text-xs">Participações em vendas</span>
          <span className="text-xs">Quantidade: {vendas.length}</span>
        </div>

        <Table className="text-xs border-1">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">ID</TableHead>
              <TableHead className="text-center">Data</TableHead>
              <TableHead className="text-center">Quantidade</TableHead>
              <TableHead className="text-center">Valor Total</TableHead>
              <TableHead className="text-center"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {vendas.length > 0 ? (
              vendas.map((v: any) => (
                <TableRow key={v.id} className="hover:cursor-pointer text-center">
                  <TableCell>{v.venda_id}</TableCell>
                  <TableCell>{formatDate(v.venda.datavenda)}</TableCell>
                  <TableCell>{v.quantidade}</TableCell>
                  <TableCell>{formatarEmReal(v.valor_total)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-3 w-3 p-0 cursor-pointer">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="space-y-1">
                        <Button variant={"ghost"} className="size-full flex justify-start gap-5 px-0 rounded-sm py-2 hover:cursor-pointer">
                          <Edit className="-ml-1 -mr-1 h-4 w-4" />
                          <span>Editar</span>
                        </Button>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="text-center h-20" colSpan={5}>
                  Produto não possui histórico de vendas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );
}
