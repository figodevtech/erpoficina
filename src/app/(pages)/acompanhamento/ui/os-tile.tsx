"use client";

import { QuadItem } from "../lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CarFront, Wrench, Clock, Building2, User2 } from "lucide-react";

function cx(...a: (string | false | null | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

function statusColors(s?: string | null) {
  const k = (s || "").toUpperCase();
  if (k === "ORCAMENTO" || k === "ORCAMENTO_RECUSADO") return "bg-amber-600/15 text-amber-400 border-amber-600/30";
  if (k === "APROVACAO_ORCAMENTO" || k === "ORCAMENTO_APROVADO")
    return "bg-yellow-600/15 text-yellow-400 border-yellow-600/30";
  if (k === "EM_ANDAMENTO") return "bg-sky-600/15 text-sky-400 border-sky-600/30";
  if (k === "PAGAMENTO") return "bg-fuchsia-600/15 text-fuchsia-400 border-fuchsia-600/30";
  if (k === "CONCLUIDO") return "bg-emerald-600/15 text-emerald-400 border-emerald-600/30";
  if (k === "CANCELADO") return "bg-rose-600/15 text-rose-400 border-rose-600/30";
  return "bg-zinc-600/15 text-zinc-200 border-zinc-600/30";
}

function prioridadePill(p?: "BAIXA" | "NORMAL" | "ALTA" | null) {
  if (p === "ALTA") return "bg-rose-600/15 text-rose-400 border-rose-600/30";
  if (p === "BAIXA") return "bg-zinc-600/10 text-zinc-300 border-zinc-600/20";
  return "bg-indigo-600/10 text-indigo-300 border-indigo-600/20";
}

function contador(iso?: string | null, nowMs?: number) {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = nowMs ?? Date.now();
  const diff = Math.max(0, now - d.getTime());
  const totalSec = Math.floor(diff / 1000);

  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function moneyBRL(n?: number | null) {
  if (typeof n !== "number") return null;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

export default function OsTile({ os, now, compact = false }: { os: QuadItem; now?: number; compact?: boolean }) {
  const isPeca = os.alvoTipo === "PECA";

  const tituloPrincipal = isPeca
    ? os.peca?.titulo || "Peça"
    : [os.veiculo?.marca, os.veiculo?.modelo].filter(Boolean).join(" ");

  // “secundária” mais informativa: placa + cor (se tiver)
  const secundaria = isPeca
    ? os.peca?.descricao || ""
    : [os.veiculo?.placa, os.veiculo?.cor].filter(Boolean).join(" • ");

  const statusLabel = (os.status || "—").replace(/_/g, " ");
  const emAndamento = (os.status || "").toUpperCase() === "EM_ANDAMENTO";

  const produtos = (os.produtos ?? []).slice(0, 3);
  const servicos = (os.servicos ?? []).slice(0, 3);
  const temItens = (os.produtos?.length ?? 0) > 0 || (os.servicos?.length ?? 0) > 0;

  return (
    <Card className={cx("border border-border/70 bg-card/95 gap-2", compact ? "p-3" : "p-3.5")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cx("font-semibold text-muted-foreground", compact ? "text-xs" : "text-sm")}>
              OS #{os.id}
            </span>

            <Badge variant="outline" className={cx("border", compact ? "text-xs" : "text-xs", statusColors(os.status))}>
              {statusLabel}
            </Badge>

            {os.prioridade ? (
              <Badge
                variant="outline"
                className={cx("border", compact ? "text-xs" : "text-xs", prioridadePill(os.prioridade))}
              >
                {os.prioridade}
              </Badge>
            ) : null}
          </div>

          <p
            className={cx(
              "mt-1 truncate font-semibold tracking-tight leading-tight",
              compact ? "text-base" : "text-base"
            )}
          >
            {tituloPrincipal || "—"}
          </p>

          {secundaria ? (
            <p className={cx("truncate text-muted-foreground", compact ? "text-sm" : "text-sm")}>{secundaria}</p>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <div className={cx("inline-flex items-center gap-1 text-muted-foreground", compact ? "text-xs" : "text-sm")}>
            <Clock className={cx(compact ? "h-4 w-4" : "h-4 w-4")} />
            <span className={emAndamento ? "font-mono font-semibold text-foreground" : ""}>
              {emAndamento ? contador(os.dataEntrada, now) : "—"}
            </span>
          </div>
          {emAndamento ? <div className="mt-0.5 text-xs text-muted-foreground">Tempo em andamento</div> : null}
        </div>
      </div>

      <div className={cx("mt-2.5 grid grid-cols-1 gap-2 text-muted-foreground", compact ? "text-sm" : "text-sm")}>
        <div className="flex items-center gap-2">
          <User2 className="h-4 w-4" />
          <span className="truncate">{os.cliente?.nome ?? "—"}</span>
        </div>

        {os.setor?.nome ? (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">{os.setor.nome}</span>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          {isPeca ? <Wrench className="h-4 w-4" /> : <CarFront className="h-4 w-4" />}
          <span className="truncate">{isPeca ? "Ordem de peça" : "Ordem de veículo"}</span>
        </div>
      </div>

      {temItens ? (
        <div className="mt-3 rounded-md border border-amber-600/20 bg-amber-600/10 p-2.5">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-300/90">Itens do orçamento</div>

          {produtos.length ? (
            <div className="mt-2">
              <div className="text-xs font-semibold text-amber-200/80">Produtos</div>
              <ul className="mt-1 space-y-1 text-sm text-amber-50/90">
                {produtos.map((p, i) => (
                  <li key={`p-${i}`} className="truncate">
                    • {p.quantidade ?? 1}x {p.produto?.titulo ?? "Produto"}{" "}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {servicos.length ? (
            <div className={cx("mt-3", !produtos.length && "mt-2")}>
              <div className="text-xs font-semibold text-amber-200/80">Serviços</div>
              <ul className="mt-1 space-y-1 text-sm text-amber-50/90">
                {servicos.map((s: any, i) => (
                  <li key={`s-${i}`} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate">
                      • {s.quantidade ?? 1}x {s.servico?.descricao ?? "Serviço"}{" "}
                      {s.realizador?.nome ? (
                        <Badge variant="destructive" className="shrink-0 text-xs">
                          {s.realizador.nome}
                        </Badge>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
