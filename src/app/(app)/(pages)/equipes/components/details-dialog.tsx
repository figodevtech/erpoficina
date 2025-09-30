"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DetalheOS } from "../types";
import { obterDetalhesOS } from "../lib/api";

const statusClasses: Record<string, string> = {
  ABERTA: "bg-blue-600/15 text-blue-400",
  EM_ANDAMENTO: "bg-amber-600/15 text-amber-400",
  AGUARDANDO_PECA: "bg-purple-600/15 text-purple-400",
  CONCLUIDA: "bg-green-600/15 text-green-400",
  CANCELADA: "bg-red-600/15 text-red-400",
};

function fmtDate(s?: string | null) {
  if (!s) return "—";
  try {
    const d = new Date(s);
    return d.toLocaleString();
  } catch {
    return s!;
  }
}

export default function EquipesDetailsDialog({
  osId,
  open,
  onOpenChange,
}: {
  osId: number | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [detalhe, setDetalhe] = useState<DetalheOS | null>(null);

  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!open || !osId) return;
      setLoading(true);
      try {
        const d = await obterDetalhesOS(osId);
        if (!ignore) setDetalhe(d);
      } catch (e) {
        console.error(e);
        if (!ignore) setDetalhe(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [open, osId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Ordem de Serviço</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-80" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-36 w-full" />
          </div>
        ) : detalhe ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">OS</div>
                <div className="font-medium">#{detalhe.id}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <Badge className={statusClasses[detalhe.status] ?? ""}>
                  {detalhe.status.replaceAll("_", " ")}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Cliente</div>
                <div>{detalhe.cliente?.nome ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Veículo</div>
                <div>
                  {detalhe.veiculo
                    ? `${detalhe.veiculo.marca} ${detalhe.veiculo.modelo} • ${detalhe.veiculo.placa}`
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Entrada</div>
                <div>{fmtDate(detalhe.dataEntrada)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Saída Prevista</div>
                <div>{fmtDate(detalhe.dataSaidaPrevista)}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Descrição</div>
              <div className="rounded-md border bg-muted/40 p-3">{detalhe.descricao || "—"}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Checklist</div>
              {detalhe.checklist.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sem itens de checklist.</div>
              ) : (
                <div className="space-y-2">
                  {detalhe.checklist.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-md border p-2">
                      <div className="text-sm">{c.item}</div>
                      <Badge
                        className={
                          c.status === "OK"
                            ? "bg-emerald-600/20 text-emerald-400"
                            : c.status === "ALERTA"
                            ? "bg-yellow-600/20 text-yellow-400"
                            : c.status === "FALHA"
                            ? "bg-red-600/20 text-red-400"
                            : "bg-muted text-foreground"
                        }
                      >
                        {c.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Não foi possível carregar os detalhes.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
