"use client";

import { Package } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const money = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

export function TabelaProdutos({
  itens,
}: {
  itens: { descricao: string; quantidade: number; precounitario: number; subtotal: number }[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold">Produtos</h3>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Descrição</TableHead>
              <TableHead className="text-center">Qtd</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">
                  Nenhum produto no orçamento.
                </TableCell>
              </TableRow>
            ) : (
              itens.map((p, i) => (
                <TableRow key={i}>
                  <TableCell className="pr-4">{p.descricao}</TableCell>
                  <TableCell className="text-center">{p.quantidade}</TableCell>
                  <TableCell className="text-right tabular-nums">{money(p.precounitario)}</TableCell>
                  <TableCell className="text-right tabular-nums">{money(p.subtotal)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
