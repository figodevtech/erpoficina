"use client";

import { CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, UserRound } from "lucide-react";

const money = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

export function CabecalhoOS({
  osId,
  clienteNome,
  totalGeral,
}: {
  osId: number;
  clienteNome?: string;
  totalGeral: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg sm:text-xl">Aprovação de Orçamento</CardTitle>
        </div>
        <Badge variant="outline" className="font-medium">
          OS #{osId}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <UserRound className="h-4 w-4" /> {clienteNome || "—"}
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="font-medium text-foreground">Total: {money(totalGeral)}</span>
      </div>
    </div>
  );
}
