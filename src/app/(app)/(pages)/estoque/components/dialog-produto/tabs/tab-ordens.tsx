"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { ChevronDown, Edit } from "lucide-react";
import { Produto } from "../../../types";

export function TabOrdens({ produto }: { produto: Produto }) {
  const ordens = (produto as any).ordensdoproduto ?? [];
  return (
    <TabsContent value="Ordens" className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
      <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
        <div className="flex flex-row items-center justify-between">
          <span className="text-xs">Participações em Ordens de Serviço</span>
          <span className="text-xs">Quantidade: {ordens.length}</span>
        </div>

        <Table className="text-xs border-1">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">ID</TableHead>
              <TableHead className="text-center">Descrição</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordens.length > 0 ? (
              ordens.map((o: any, idx: number) => (
                <TableRow key={idx} className="hover:cursor-pointer text-center">
                  <TableCell>{o.ordem.id}</TableCell>
                  <TableCell className="max-w-[100px] overflow-hidden  truncate">{o.ordem.descricao || "-"}</TableCell>
                  <TableCell>{o.ordem.status}</TableCell>
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
                <TableCell className="text-center h-20" colSpan={4}>
                  Produto não possui histórico de Ordens de Serviço
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );
}
