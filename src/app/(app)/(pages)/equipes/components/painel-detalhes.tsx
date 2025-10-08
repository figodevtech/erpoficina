"use client";

import type { DetalheOS } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BadgeStatus } from "./badge-status";
import { BadgePrioridade } from "./badge-prioridade";
import { DialogChecklist } from "./dialog-checklist";
import { Calendar, CheckCircle2, Clock, User, X, Car } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* Util: pega o primeiro valor verdade entre várias chaves possíveis */
function firstTruthy<T = any>(obj: any, keys: string[]): T | null {
  for (const k of keys) {
    const v = obj?.[k];
    if (v) return v as T;
  }
  return null;
}

/* Util: conversor robusto para Date */
function toDate(val: any): Date | null {
  if (!val) return null;
  if (typeof val === "number") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === "string" && /^\d+$/.test(val)) {
    const d = new Date(Number(val));
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === "string") {
    let s = val;
    if (s.includes(" ") && !s.includes("T")) s = s.replace(" ", "T");
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
  }
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/* Util: humaniza duração em ms para "Xd Xh Xm" */
function humanizeDuration(ms: number) {
  if (!isFinite(ms)) return "—";
  if (ms < 0) ms = 0;
  const totalMin = Math.floor(ms / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
}

interface PainelDetalhesProps {
  ordem: DetalheOS;
  aoFechar?: () => void;
  aoAssumirOrdem: (ordemId: number) => void;
  aoFinalizarOrdem: (ordemId: number, observacoes: string) => void;
}

export function PainelDetalhes({ ordem, aoFechar, aoAssumirOrdem, aoFinalizarOrdem }: PainelDetalhesProps) {
  const [observacoes, setObservacoes] = useState(ordem.observacoes || "");
  const podeAssumir = ordem.status === "ABERTA";
  const podeFinalizar = ordem.status === "EM_ANDAMENTO";

  // Datas com fallbacks SEM usar updatedAt como saída real
  const dataEntrada = toDate(
    ordem.dataEntrada ?? firstTruthy(ordem as any, ["dataentrada", "entrada", "createdat", "created_at", "createdAt"])
  );

  // Só considerar campos explícitos de saída real
  const dataSaida = toDate(ordem.dataSaida ?? firstTruthy(ordem as any, ["datasaidareal", "saida_real"]));

  // Tempo de abertura: de entrada até agora (ou até saída real se existir)
  const tempoAbertura = dataEntrada
    ? humanizeDuration(((dataSaida ?? new Date()) as Date).getTime() - dataEntrada.getTime())
    : "—";

  function getClienteNome(cliente: unknown): string {
    const c = cliente as any;
    return c?.nome ?? c?.nomerazaosocial ?? c?.nomeRazaoSocial ?? c?.razaoSocial ?? c?.razao ?? "—";
  }

  const veiculoStr = ordem.veiculo ? `${ordem.veiculo.marca ?? ""} ${ordem.veiculo.modelo ?? ""}`.trim() : "—";
  const placaStr = ordem.veiculo?.placa ?? "";

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-start justify-between space-y-0 border-b pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl">Ordem de Serviço</CardTitle>
          <p className="font-mono text-sm text-muted-foreground">OS #{ordem.id}</p>
        </div>
        {aoFechar && (
          <Button variant="ghost" size="icon" onClick={aoFechar} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-6 overflow-auto">
        <div className="flex flex-wrap gap-2">
          <BadgeStatus status={ordem.status} />
          {ordem.prioridade && <BadgePrioridade prioridade={ordem.prioridade} />}
        </div>

        {/* Cliente */}
        <div className="space-y-3">
          <h3 className="font-semibold">Cliente</h3>
          <div className="space-y-2 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{getClienteNome(ordem.cliente)}</span>
            </div>
          </div>
        </div>

        {/* Veículo */}
        <div className="space-y-3">
          <h3 className="font-semibold">Veículo</h3>
          <div className="space-y-2 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2 text-sm">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{veiculoStr || "—"}</span>
            </div>
            {placaStr && (
              <div className="text-sm">
                <span className="text-muted-foreground">Placa:</span>{" "}
                <span className="font-mono font-medium">{placaStr}</span>
              </div>
            )}
          </div>
        </div>

        {/* Descrição */}
        {!!ordem.descricao && (
          <div className="space-y-3">
            <h3 className="font-semibold">Descrição do Serviço</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{ordem.descricao}</p>
          </div>
        )}

        {/* Descrição */}
        {!!ordem.descricao && (
          <div className="space-y-3">
            <h3 className="font-semibold">Observações</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{ordem.observacoes}</p>
          </div>
        )}

        <Separator />

        {/* Checklist */}
        {ordem.checklist && ordem.checklist.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Checklist de Entrada</h3>
            <DialogChecklist checklist={ordem.checklist} />
          </div>
        )}

        <Separator />

        {/* Cronologia */}
        <div className="space-y-3">
          <h3 className="font-semibold">Cronologia</h3>
          <div className="space-y-2">
            {dataEntrada && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Entrada:</span>
                <span className="font-medium">{format(dataEntrada, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tempo de abertura:</span>
              <span className="font-medium">{tempoAbertura}</span>
            </div>

            {dataSaida && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Saída real:</span>
                <span className="font-medium">{format(dataSaida, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Observações */}
      </CardContent>

      {/* Ações */}
      <div className="border-t p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          {podeAssumir && (
            <Button onClick={() => aoAssumirOrdem(ordem.id)} className="flex-1" size="lg">
              <User className="mr-2 h-4 w-4" />
              Assumir Ordem
            </Button>
          )}
          {podeFinalizar && (
            <Button
              onClick={() => aoFinalizarOrdem(ordem.id, observacoes)}
              className="flex-1"
              size="lg"
              variant="default"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Finalizar Ordem
            </Button>
          )}
          {!podeAssumir && !podeFinalizar && (
            <div className="flex-1 rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">
              Esta ordem já foi {ordem.status === "CONCLUIDA" ? "concluída" : "cancelada"}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
