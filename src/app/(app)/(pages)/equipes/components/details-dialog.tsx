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
function fmtTime(s?: string | null) {
  if (!s) return "—";
  try {
    const d = new Date(s);
    return d.toLocaleTimeString();
  } catch {
    return "—";
  }
}

/** Helpers defensivos para lidar com variações de payload */
function getClienteNome(d: any): string {
  return d?.cliente?.nome ?? d?.cliente?.nomerazaosocial ?? d?.cliente_nome ?? d?.clienteNome ?? d?.cliente_name ?? "—";
}
function getVeiculoStr(d: any): string {
  const v = d?.veiculo ?? {};
  const placa = v?.placa ?? d?.veiculo_placa ?? null;
  const modelo = v?.modelo ?? d?.veiculo_modelo ?? null;
  const marca = v?.marca ?? d?.veiculo_marca ?? null;

  if (placa || modelo || marca) {
    const mm = [marca, modelo].filter(Boolean).join(" ");
    return (mm ? mm : "Veículo") + (placa ? ` • ${placa}` : "");
  }
  return "—";
}
function getDataEntrada(d: any): string | null {
  return d?.dataEntrada ?? d?.dataentrada ?? d?.createdat ?? d?.createdAt ?? d?.data_entrada ?? null;
}
function getSaidaPrevista(d: any): string | null {
  return d?.dataSaidaPrevista ?? d?.datasaidaprevista ?? d?.data_saida_prevista ?? null;
}
function getDescricao(d: any): string | null {
  return d?.descricao ?? d?.descricao_os ?? null;
}
function getObservacoes(d: any): string | null {
  return d?.observacoes ?? d?.observacao ?? d?.obs ?? null;
}
function getStatus(d: any): string {
  return (d?.status ?? "ABERTA").toString();
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

  const st = getStatus(detalhe as any);
  const clienteNome = getClienteNome(detalhe as any);
  const veiculoStr = getVeiculoStr(detalhe as any);
  const dataEntrada = getDataEntrada(detalhe as any);
  const saidaPrevista = getSaidaPrevista(detalhe as any);
  const descricao = getDescricao(detalhe as any);
  const observacoes = getObservacoes(detalhe as any);
  const checklist = (detalhe as any)?.checklist ?? [];

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
                <Badge className={statusClasses[st] ?? ""}>{st.replaceAll("_", " ")}</Badge>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Cliente</div>
                <div>{clienteNome}</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Veículo</div>
                <div>{veiculoStr}</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Abertura (data/hora)</div>
                <div>{fmtDate(dataEntrada)}</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Saída Prevista</div>
                <div>{fmtDate(saidaPrevista)}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Descrição</div>
              <div className="rounded-md border bg-muted/40 p-3">{descricao || "—"}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Observações</div>
              <div className="rounded-md border bg-muted/40 p-3">{observacoes || "—"}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Checklist</div>
              {(checklist?.length ?? 0) === 0 ? (
                <div className="text-sm text-muted-foreground">Sem itens de checklist.</div>
              ) : (
                <div className="space-y-2">
                  {checklist.map((c: any) => (
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
