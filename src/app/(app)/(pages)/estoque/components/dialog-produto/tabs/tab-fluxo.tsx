"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { ChevronDown, Edit, Undo2 } from "lucide-react";
import { Produto } from "../../../types";
import { formatDate } from "@/utils/formatDate";
import { useState } from "react";
import { DialogEntradaGeral } from "../../dialog-entrada-geral/dialog-entrada-geral";
import { set } from "nprogress";
import { Receipt } from "lucide-react";
import { EmissaoNotaDialog } from "@/app/(app)/(pages)/ordens/components/dialogs/emissao-nota-dialog/emissao-nota-dialog";

export function TabFluxo({ produto }: { produto: Produto }) {
  const entradas = (produto as any).entrada ?? [];
  const [selectedEntradaId, setSelectedEntradaId] = useState<number | null>(null);
  const [openDialogEntradaGeral, setOpenDialogEntradaGeral] = useState(false);
  
  const [nfeDialogEntradaId, setNfeDialogEntradaId] = useState<number | null>(null);
  
  return (
    <TabsContent value="Fluxo" className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
      <EmissaoNotaDialog 
        open={!!nfeDialogEntradaId}
        onOpenChange={(v) => !v && setNfeDialogEntradaId(null)}
        entradaId={nfeDialogEntradaId}
      />
      <DialogEntradaGeral
      selectedEntradaId={selectedEntradaId ?? undefined}
      open={openDialogEntradaGeral}
      onOpenChange={(v)=>{
        if(!v){
          setSelectedEntradaId(null)
          setOpenDialogEntradaGeral(false)
        }else{
          setOpenDialogEntradaGeral(true)
        }}}
      />
      <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
        <div className="flex flex-row items-center justify-between">
          <span className="text-xs">Movimentações em estoque</span>
          <span className="text-xs">Quantidade: {entradas.length}</span>
        </div>

        <Table className="text-xs border-1">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">ID</TableHead>
              <TableHead className="text-center">Data:</TableHead>
              <TableHead className="text-center">Fornecedor</TableHead>
              <TableHead className="text-center">Quantidade</TableHead>
              <TableHead className="text-center"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {entradas.length > 0 ? (
              entradas.map((e: any) => (
                <TableRow key={e.id} className="hover:cursor-pointer text-center">
                  <TableCell>{e.id}</TableCell>
                  <TableCell>{formatDate(e.created_at)}</TableCell>
                  <TableCell>{e.entradainfo.fornecedor.nomerazaosocial}</TableCell>
                  <TableCell className="text-green-600 font-bold">+ {e.quantidade}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-3 w-3 p-0 cursor-pointer">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="space-y-1">
                        <Button onClick={()=>{
                          setSelectedEntradaId(e.entradainfo.id)
                          setOpenDialogEntradaGeral(true)
                        }} variant={"ghost"} className="size-full flex justify-start gap-5 px-0 rounded-sm py-2 hover:cursor-pointer">
                          <Edit className="-ml-1 -mr-1 h-4 w-4" />
                          <span>Editar</span>
                        </Button>
                        <Button className="size-full flex justify-start gap-5 bg-red-500/50 hover:bg-red-500 px-0 rounded-sm py-2 hover:cursor-pointer">
                          <Undo2 className="-ml-1 -mr-1 h-4 w-4" />
                          <span>Cancelar Entrada</span>
                        </Button>
                        <Button onClick={()=>{
                          setNfeDialogEntradaId(e.entradainfo.id)
                        }} variant={"ghost"} className="size-full flex justify-start gap-5 px-0 rounded-sm py-2 hover:cursor-pointer">
                          <Receipt className="-ml-1 -mr-1 h-4 w-4 text-emerald-500" />
                          <span>Emitir Nota</span>
                        </Button>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="text-center h-20" colSpan={5}>
                  Produto não possui histórico de movimentação no estoque
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );
}
