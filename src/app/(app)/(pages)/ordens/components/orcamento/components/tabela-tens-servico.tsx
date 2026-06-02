"use client";

import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ItemServico } from "../tipos";
import { CampoPreco } from "./campo-preco";
import { CampoQuantidade } from "./campo-quantidade";
import { CampoDesconto } from "./campo-desconto";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function TabelaItensServico({
  itens,
  onAtualizar,
  onRemover,
}: {
  itens: ItemServico[];
  onAtualizar: (index: number, patch: Partial<ItemServico>) => void;
  onRemover: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Serviços</Label>
        <Badge variant="outline" className="font-normal">
          {itens.length} item(ns)
        </Badge>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[48%]">Descrição</TableHead>
              <TableHead className="w-[20%] text-center">Quantidade</TableHead>
              <TableHead className="w-[16%] text-right">Preço unit.</TableHead>
              <TableHead className="w-[24%]">Desconto</TableHead>
              <TableHead className="w-[12%] text-right">Subtotal</TableHead>
              <TableHead className="w-[4%] text-center">Ação</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {itens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  Nenhum serviço adicionado.
                </TableCell>
              </TableRow>
            ) : (
              itens.map((it, i) => (
                <TableRow key={`${it.servicoid}-${i}`}>
                  <TableCell className="max-w-[340px] pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="min-w-[140px] max-w-[260px] flex-1 truncate font-medium">{it.descricao}</p>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs text-xs">
                            {it.descricao}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Input
                        value={it.descricaoServico ?? ""}
                        onChange={(e) =>
                          onAtualizar(i, {
                            descricaoServico: e.target.value.trim() ? e.target.value : null,
                          })
                        }
                        placeholder="Descrição do serviço (opcional)"
                        className="h-7 w-full text-xs sm:w-[230px]"
                      />
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <CampoQuantidade
                      value={it.quantidade}
                      onChange={(n) =>
                        onAtualizar(i, {
                          quantidade: n,
                          subtotal: Number((n * it.precounitario).toFixed(2)),
                        })
                      }
                      min={0}
                    />
                  </TableCell>

                  <TableCell className="text-right">
                    <CampoPreco
                      value={it.precounitario}
                      onChange={(n) =>
                        onAtualizar(i, {
                          precounitario: n,
                          subtotal: Number((n * it.quantidade).toFixed(2)),
                        })
                      }
                    />
                  </TableCell>

                  <TableCell className="min-w-[240px]">
                    <CampoDesconto
                      tipo={it.descontoTipo}
                      valor={it.desconto}
                      onTipoChange={(descontoTipo) =>
                        onAtualizar(i, {
                          descontoTipo,
                          desconto: descontoTipo ? it.desconto ?? 0 : 0,
                        })
                      }
                      onValorChange={(desconto) => onAtualizar(i, { desconto })}
                    />
                  </TableCell>

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
