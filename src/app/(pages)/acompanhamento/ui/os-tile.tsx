"use client";

import { QuadItem } from "../lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Wrench, CarFront } from "lucide-react";

function cx(...a: (string | false | null | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

function statusColors(s?: string | null) {
  const k = (s || "").toUpperCase();
  // paleta forte p/ leitura à distância
  if (k === "ORCAMENTO" || k === "ORCAMENTO_RECUSADO") return "bg-amber-600 text-amber-50 border-amber-700";
  if (k === "APROVACAO_ORCAMENTO" || k === "ORCAMENTO_APROVADO") return "bg-yellow-700 text-yellow-50 border-yellow-800";
  if (k === "EM_ANDAMENTO") return "bg-sky-700 text-sky-50 border-sky-800";
  if (k === "PAGAMENTO") return "bg-fuchsia-700 text-fuchsia-50 border-fuchsia-800";
  if (k === "CONCLUIDO") return "bg-emerald-700 text-emerald-50 border-emerald-800";
  if (k === "CANCELADO") return "bg-rose-700 text-rose-50 border-rose-800";
  return "bg-zinc-700 text-zinc-50 border-zinc-800";
}

function prioridadeBorder(p?: "BAIXA" | "NORMAL" | "ALTA" | null) {
  if (p === "ALTA") return "ring-4 ring-rose-700/60";
  if (p === "BAIXA") return "ring-2 ring-zinc-600/40";
  return "ring-3 ring-zinc-700/50";
}

export default function OsTile({ os }: { os: QuadItem }) {
  const isPeca = os.alvoTipo === "PECA";
  const isVeiculo = !isPeca; // padrão VEICULO caso não venha o campo

  const tituloPrincipal = isPeca
    ? os.peca?.titulo || "Peça"
    : [os.veiculo?.modelo, os.veiculo?.cor ? `(${os.veiculo?.cor})` : null]
        .filter(Boolean)
        .join(" ");

  const secundaria = isPeca
    ? os.descricao || os.peca?.descricao || ""
    : os.veiculo?.placa || "";

  return (
    <Card
      className={cx(
        "p-4 md:p-5 border-2 bg-background/70",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.04)]",
        "hover:shadow-[0_0_0_2px_rgba(255,255,255,0.08)] transition-shadow",
        prioridadeBorder(os.prioridade),
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* cabeçalho ID + status grande */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs md:text-sm bg-zinc-800 border-zinc-700">
            #{os.id}
          </Badge>
          <Badge
            className={cx(
              "text-[11px] md:text-sm font-extrabold tracking-wide border px-2.5 py-1 uppercase",
              statusColors(os.status),
            )}
          >
            {os.status?.replace(/_/g, " ") || "—"}
          </Badge>
        </div>

        {/* setor */}
        {os.setor?.nome ? (
          <Badge variant="outline" className="text-[11px] md:text-sm border-zinc-600 bg-zinc-900/40">
            {os.setor.nome}
          </Badge>
        ) : null}
      </div>

      <div className="mt-3 md:mt-4">
        {/* título grande pra ler de longe */}
        <div className="flex items-center gap-2 mb-1">
          {isPeca ? (
            <Wrench className="h-5 w-5 md:h-6 md:w-6 opacity-80" />
          ) : (
            <CarFront className="h-5 w-5 md:h-6 md:w-6 opacity-80" />
          )}
          <h3 className="text-xl md:text-2xl font-black tracking-tight line-clamp-1">{tituloPrincipal || "—"}</h3>
        </div>

        {/* linha secundária: peça desc OU placa; cliente opcional */}
        <div className="text-sm md:text-base text-muted-foreground line-clamp-1">
          {secundaria || "—"}
          {os.cliente?.nome ? (
            <>
              <span className="mx-2 opacity-40">•</span>
              <span className="font-medium">{os.cliente.nome}</span>
            </>
          ) : null}
        </div>
      </div>

      {/* descrição curta (se tiver) */}
      {os.descricao ? (
        <div className="mt-3 text-xs md:text-sm text-zinc-300 line-clamp-2">
          <ClipboardList className="h-3.5 w-3.5 inline-block mr-1 -mt-0.5 opacity-70" />
          {os.descricao}
        </div>
      ) : null}

      {/* rodapé enxuto: datas */}
      <div className="mt-3 md:mt-4 flex items-center justify-between text-[11px] md:text-xs text-zinc-400">
        <div>
          <span className="opacity-80">Entrada:</span>{" "}
          {os.dataEntrada ? new Date(os.dataEntrada).toLocaleString() : "—"}
        </div>
        <div>
          <span className="opacity-80">Saída:</span>{" "}
          {os.dataSaida ? new Date(os.dataSaida).toLocaleDateString() : "—"}
        </div>
      </div>
    </Card>
  );
}
