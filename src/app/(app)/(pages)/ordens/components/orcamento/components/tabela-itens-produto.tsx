// src/app/(app)/(pages)/ordens/components/orcamento/componentes/tabela-itens-produto.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ItemProduto } from "../tipos";
import { CampoQuantidade } from "./campo-quantidade";

const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function TabelaItensProduto({
  itens,
  onAtualizar,
  onRemover,
}: {
  itens: ItemProduto[];
  onAtualizar: (index: number, patch: Partial<ItemProduto>) => void;
  onRemover: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Produtos</Label>
        <Badge variant="outline" className="font-normal">
          {itens.length} item(ns)
        </Badge>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[48%]">Descrição</TableHead>
              <TableHead className="w-[20%] text-center">Quantidade</TableHead>
              <TableHead className="w-[16%] text-right">Preço unit.</TableHead>
              <TableHead className="w-[12%] text-right">Subtotal</TableHead>
              <TableHead className="w-[4%] text-center">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  Nenhum produto adicionado.
                </TableCell>
              </TableRow>
            ) : (
              itens.map((it, i) => (
                <TableRow key={`${it.produtoid}-${i}`}>
                  <TableCell className="pr-4">{it.descricao}</TableCell>
                  <TableCell className="text-center">
                    <CampoQuantidade value={it.quantidade} onChange={(n) => onAtualizar(i, { quantidade: n })} min={0} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{money(it.precounitario)}</TableCell>
                  <TableCell className="text-right tabular-nums">{money(it.subtotal)}</TableCell>
                  <TableCell className="text-center">
                    <Button size="icon" variant="ghost" onClick={() => onRemover(i)} title="Remover">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
