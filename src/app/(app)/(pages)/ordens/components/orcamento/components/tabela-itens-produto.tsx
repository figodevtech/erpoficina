// src/app/(app)/(pages)/ordens/components/orcamento/components/tabela-itens-produto.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import type { ItemProduto } from "../tipos";
import { CampoQuantidade } from "./campo-quantidade";

const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  itens: ItemProduto[];
  onAtualizar: (index: number, patch: Partial<ItemProduto>) => void;
  onRemover: (index: number) => void;
  // produtoid -> {disponivel, solicitado}
  errosEstoque?: Record<number, { disponivel: number; solicitado: number }>;
};

export function TabelaItensProduto({ itens, onAtualizar, onRemover, errosEstoque }: Props) {
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
              itens.map((it, i) => {
                const falta = errosEstoque?.[it.produtoid];
                return (
                  <TableRow
                    key={`${it.produtoid}-${i}`}
                    className={falta ? "bg-destructive/5" : undefined}
                    title={falta ? `Disponível: ${falta.disponivel} • Solicitado: ${falta.solicitado}` : undefined}
                  >
                    <TableCell className="pr-4">
                      <div className="flex items-center gap-2">
                        {falta && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                        <span>{it.descricao}</span>
                      </div>
                      {falta && (
                        <div className="mt-1 text-xs text-destructive">
                          Estoque insuficiente — disponível: <b>{falta.disponivel}</b>, solicitado:{" "}
                          <b>{falta.solicitado}</b>.
                        </div>
                      )}
                    </TableCell>
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
