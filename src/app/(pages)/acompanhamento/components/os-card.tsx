"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CarFront, User2, Clock } from "lucide-react";
import * as React from "react";

function tempoRelativo(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${m ? ` ${m}min` : ""}`;
}

export function OsCard({
  id,
  descricao,
  cliente,
  veiculo,
  setor,
  status,
  dataEntrada,
  onClick,
}: {
  id: number;
  descricao: string | null;
  cliente: { id: number; nome: string } | null;
  veiculo: { id: number; placa: string; modelo: string; marca: string } | null;
  setor: { id: number; nome: string } | null;
  status: "ABERTA" | "EM_ANDAMENTO";
  dataEntrada: string | null;
  onClick?: () => void;
}) {
  const badgeClass =
    status === "EM_ANDAMENTO"
      ? "bg-amber-600/15 text-amber-500"
      : "bg-blue-600/15 text-blue-400";

  return (
    <Card
      className="p-3 sm:p-4 hover:shadow-md transition cursor-pointer border-border bg-card"
      onClick={onClick}
      role="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="font-semibold">OS #{id}</div>
        <Badge className={badgeClass}>
          {status === "EM_ANDAMENTO" ? "Em atendimento" : "Aguardando"}
        </Badge>
      </div>

      <div className="mt-2 text-sm text-foreground line-clamp-2">
        {descricao || <span className="text-muted-foreground">Sem descrição</span>}
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <User2 className="h-3.5 w-3.5" />
          <span className="truncate">{cliente?.nome ?? "—"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CarFront className="h-3.5 w-3.5" />
          <span className="truncate">
            {veiculo ? `${veiculo.modelo} • ${veiculo.placa}` : "—"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" />
          <span className="truncate">{setor?.nome ?? "—"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>Entrada: {tempoRelativo(dataEntrada)}</span>
        </div>
      </div>
    </Card>
  );
}
