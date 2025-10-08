"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { DetalheOS } from "../types";

interface DialogChecklistProps {
  checklist: DetalheOS["checklist"];
}

export function DialogChecklist({ checklist }: DialogChecklistProps) {
  const getStatusIcon = (status: "OK" | "ALERTA" | "FALHA") => {
    switch (status) {
      case "OK":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "ALERTA":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "FALHA":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const BADGE_STYLES: Record<"OK" | "ALERTA" | "FALHA", string> = {
    OK: "bg-green-500/10 text-green-500",
    ALERTA: "bg-yellow-500/10 text-yellow-500 ",
    FALHA: "bg-red-500/10 text-red-500 ",
  };

  const LABELS = { OK: "OK", ALERTA: "Alerta", FALHA: "Falha" } as const;

  const getStatusBadge = (status: "OK" | "ALERTA" | "FALHA") => (
    <Badge variant="outline" className={`font-medium ${BADGE_STYLES[status]}`}>
      {LABELS[status]}
    </Badge>
  );

  const totalItens = checklist.length;
  const itensOk = checklist.filter((item) => item.status === "OK").length;
  const itensAlerta = checklist.filter((item) => item.status === "ALERTA").length;
  const itensFalha = checklist.filter((item) => item.status === "FALHA").length;

 
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full bg-transparent">
          <ClipboardList className="mr-2 h-4 w-4" />
          Ver Checklist Completo
        </Button>
      </DialogTrigger>

      {/* overflow-hidden aqui; quem rola é a lista abaixo */}
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Checklist de Entrada</DialogTitle>
          <DialogDescription>Verificações realizadas na entrada do veículo na oficina</DialogDescription>
        </DialogHeader>

        <div className="mb-4 grid grid-cols-4 gap-2">
          <div className="rounded-lg bg-muted p-2 text-center">
            <div className="text-2xl font-bold">{totalItens}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="rounded-lg bg-green-500/10 p-2 text-center">
            <div className="text-2xl font-bold text-green-600">{itensOk}</div>
            <div className="text-xs text-muted-foreground">OK</div>
          </div>
          <div className="rounded-lg bg-yellow-100 p-2 text-center">
            <div className="text-2xl font-bold text-yellow-600">{itensAlerta}</div>
            <div className="text-xs text-muted-foreground">Alertas</div>
          </div>
          <div className="rounded-lg bg-red-500/10 p-2 text-center">
            <div className="text-2xl font-bold text-red-600">{itensFalha}</div>
            <div className="text-xs text-muted-foreground">Falhas</div>
          </div>
        </div>

        {/* lista rolável com padding no fundo */}
        <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-2 pb-4">
          {checklist.map((item) => (
            <div key={item.id} className="rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  {getStatusIcon(item.status)}
                  <div className="flex-1">
                    <p className="font-medium leading-tight">{item.item}</p>
                    {item.observacao && (
                      <p className="mt-1 text-sm text-muted-foreground">{item.observacao}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(item.status)}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}