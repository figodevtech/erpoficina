"use client";

import type { DetalheOS } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeStatus } from "./badge-status";
import { BadgePrioridade } from "./badge-prioridade";
import { DialogChecklist } from "./dialog-checklist";
import { Calendar, CheckCircle2, Clock, User, X, Car } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";
import { Separator } from "@/components/ui/separator";

function toDate(val: any): Date | null {
  if (!val) return null;
  const d = new Date(typeof val === "string" && val.includes(" ") && !val.includes("T") ? val.replace(" ", "T") : val);
  return isNaN(d.getTime()) ? null : d;
}

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
  carregando?: boolean;
  aoFechar?: () => void;
  aoAssumirOrdem: (ordemId: number) => void;
  aoFinalizarOrdem: (ordemId: number, observacoes: string) => void;
}

export function PainelDetalhes({
  ordem,
  carregando = false,
  aoFechar,
  aoAssumirOrdem,
  aoFinalizarOrdem,
}: PainelDetalhesProps) {
  const podeAssumir = ordem.status === "ABERTA";
  const podeFinalizar = ordem.status === "EM_ANDAMENTO";

  const dataEntrada = useMemo(
    () =>
      toDate(
        (ordem as any).dataEntrada ??
          (ordem as any).dataentrada ??
          (ordem as any).createdAt ??
          (ordem as any).created_at ??
          (ordem as any).createdat
      ),
    [ordem]
  );
  const dataSaida = useMemo(
    () => toDate((ordem as any).dataSaida ?? (ordem as any).datasaidareal ?? (ordem as any).saida_real),
    [ordem]
  );

  const clienteNome =
    (ordem as any)?.cliente?.nome ??
    (ordem as any)?.cliente?.nomerazaosocial ??
    (ordem as any)?.cliente?.nomeRazaoSocial ??
    (ordem as any)?.cliente?.razaoSocial ??
    (ordem as any)?.cliente?.razao ??
    "—";

  const veiculoStr = ordem.veiculo ? `${ordem.veiculo.marca ?? ""} ${ordem.veiculo.modelo ?? ""}`.trim() : "—";
  const placaStr = ordem.veiculo?.placa ?? "";

  return (
    <Card className="relative flex h-full flex-col">
      {/* Overlay de carregamento enquanto troca de OS */}
      {carregando && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
            <span className="text-sm text-muted-foreground">Carregando detalhes…</span>
          </div>
        </div>
      )}

      <CardHeader className="relative flex-row items-start justify-between space-y-0 border-b pb-4 pr-10">
        <div className="space-y-1">
          <CardTitle className="text-xl">Ordem de Serviço</CardTitle>
          <p className="font-mono text-sm text-muted-foreground">OS #{ordem.id}</p>
        </div>
        {aoFechar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={aoFechar}
            aria-label="Fechar painel"
            className="absolute right-2 top-2 lg:hidden"
          >
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
              <span className="font-medium">{clienteNome}</span>
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

        {/* Observações */}
        {!!ordem.observacoes && (
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
                <span className="font-medium">
                  {format(dataEntrada, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tempo de abertura:</span>
              <span className="font-medium">
                {dataEntrada ? humanizeDuration((dataSaida ?? new Date()).getTime() - dataEntrada.getTime()) : "—"}
              </span>
            </div>

            {dataSaida && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Saída real:</span>
                <span className="font-medium">
                  {format(dataSaida, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <div className="border-t p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          {podeAssumir && (
            <Button onClick={() => aoAssumirOrdem(ordem.id)} className="flex-1" size="default">
              <User className="mr-2 h-4 w-4" />
              Assumir Ordem
            </Button>
          )}
          {podeFinalizar && (
            <Button
              onClick={() => aoFinalizarOrdem(ordem.id, ordem.observacoes ?? "")}
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
