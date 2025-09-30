"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { QuadItem } from "../lib/api";

function fmt(s?: string | null) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("pt-BR");
  } catch {
    return s ?? "—";
  }
}

export default function OsTile({ os, destaque }: { os: QuadItem; destaque?: boolean }) {
  return (
    <Card className={["p-3 md:p-4 bg-card border", destaque ? "ring-2 ring-primary/50" : ""].join(" ")}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">OS #{os.id}</div>
          <div className="text-sm font-medium line-clamp-2">{os.descricao || "Sem descrição"}</div>
        </div>
        <Badge variant="outline" className="shrink-0">
          {os.setor?.nome ?? "—"}
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="space-y-0.5">
          <div className="text-muted-foreground">Cliente</div>
          <div className="font-medium truncate">{os.cliente?.nome ?? "—"}</div>
        </div>
        <div className="space-y-0.5 text-right">
          <div className="text-muted-foreground">Status</div>
          <div className="font-medium">{os.status.replaceAll("_", " ")}</div>
        </div>

        <div className="space-y-0.5 col-span-2">
          <div className="text-muted-foreground">Veículo</div>
          <div className="font-medium truncate">
            {os.veiculo ? `${os.veiculo.modelo} • ${os.veiculo.placa}` : "—"}
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-muted-foreground">Entrada</div>
          <div className="font-medium">{fmt(os.dataEntrada)}</div>
        </div>
        <div className="space-y-0.5 text-right">
          <div className="text-muted-foreground">Saída real</div>
          <div className="font-medium">{fmt(os.dataSaidaReal)}</div>
        </div>
      </div>
    </Card>
  );
}
