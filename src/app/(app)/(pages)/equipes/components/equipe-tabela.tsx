"use client";

import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  ClipboardCheck,
  Loader,
  MoreHorizontal,
} from "lucide-react";
import { RowOS } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TableSkeleton from "../../../components/table-skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusClasses: Record<string, string> = {
  ABERTA: "bg-blue-600/15 text-blue-400",
  EM_ANDAMENTO: "bg-amber-600/15 text-amber-400",
  AGUARDANDO_PECA: "bg-purple-600/15 text-purple-400",
  CONCLUIDA: "bg-green-600/15 text-green-400",
  CANCELADA: "bg-red-600/15 text-red-400",
};

const prioClasses: Record<string, string> = {
  ALTA: "bg-red-600/15 text-red-500",
  NORMAL: "bg-amber-600/15 text-amber-500",
  BAIXA: "bg-emerald-600/15 text-emerald-500",
};

function priorityRowClasses(p?: string | null) {
  const v = (p || "").toUpperCase();
  if (v === "ALTA") return "bg-red-50 dark:bg-red-950/30";
  if (v === "NORMAL") return "bg-amber-50 dark:bg-amber-950/30";
  if (v === "BAIXA") return "bg-emerald-50 dark:bg-emerald-950/30";
  return "";
}

function prioWeight(p?: string | null) {
  const v = (p || "").toUpperCase();
  return v === "ALTA" ? 0 : v === "NORMAL" ? 1 : 2;
}
function tsAsc(d?: string | null) {
  return d ? new Date(d).getTime() : Number.MAX_SAFE_INTEGER;
}

/** tick para re-render a cada X ms (mostradores “ao vivo”) */
function useNowTick(periodMs = 60000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), periodMs);
    return () => clearInterval(id);
  }, [periodMs]);
  return now;
}
function fmtDuration(ms: number) {
  if (ms < 0) ms = 0;
  const m = Math.floor(ms / 60000);
  const d = Math.floor(m / (60 * 24));
  const h = Math.floor((m % (60 * 24)) / 60);
  const min = m % 60;
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  parts.push(`${min}m`);
  return parts.join(" ");
}

/** util para pegar o primeiro campo de data válido em milissegundos */
function pickTs(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = obj?.[k];
    if (!v) continue;
    const t = new Date(v).getTime();
    if (!Number.isNaN(t)) return t;
  }
  return undefined;
}

export default function EquipesTable({
  rows,
  loading,
  showSkeleton,
  empty,
  onDetalhes,
  onAssumir,
  pagination,
  onPaginate,
  onChangeLimit,
}: {
  rows: RowOS[];
  loading: boolean;
  showSkeleton: boolean;
  empty: boolean;
  onDetalhes: (row: RowOS) => void;
  onAssumir: (row: RowOS) => void;
  pagination?: {
    page?: number;
    totalPages?: number;
    limit?: number;
    total?: number;
    pageCount?: number;
  };
  onPaginate?: (page: number, limit: number) => void;
  onChangeLimit?: (limit: number) => void;
}) {
  const now = useNowTick(60000);

  // Ordena por prioridade e mais antigas primeiro
  const sortedRows = useMemo(() => {
    const arr = [...(rows || [])];
    arr.sort((a: any, b: any) => {
      const w = prioWeight(a?.prioridade) - prioWeight(b?.prioridade);
      if (w !== 0) return w;
      const da = tsAsc(a?.updatedat ?? a?.atualizadoEm ?? a?.updatedAt ?? a?.createdat ?? a?.createdAt);
      const db = tsAsc(b?.updatedat ?? b?.atualizadoEm ?? b?.updatedAt ?? b?.createdat ?? b?.createdAt);
      return da - db;
    });
    return arr;
  }, [rows]);

  // Defaults de paginação
  const page = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const limit = pagination?.limit ?? 10;
  const total = pagination?.total ?? rows.length;
  const pageCount = pagination?.pageCount ?? rows.length;

  const start = limit * (page - 1) + (pageCount ? 1 : 0);
  const end = limit * (page - 1) + pageCount;

  // Bases de data
  const getCriadaEm = (r: any) =>
    pickTs(r, ["dataEntrada", "entrada", "createdat", "createdAt"]);
  const getAssumidaEm = (r: any) =>
    pickTs(r, [
      "assumidaEm",
      "assumidoEm",
      "iniciadaEm",
      "inicioExecucao",
      "iniciadoEm",
      "dataInicio",
      "datainicio",
    ]);
  const getAtualizadaEm = (r: any) => pickTs(r, ["updatedat", "updatedAt"]);
  const getSaidaReal = (r: any) => pickTs(r, ["dataSaidaReal"]);

  /** Tempo de espera: da criação até ser assumida.
   *  - Se ainda ABERTA: agora - criadaEm
   *  - Se já assumida: assumidaEm - criadaEm
   *  - Fallback: se não houver “assumidaEm”, usa updatedAt quando status !== ABERTA
   */
  const renderEspera = (r: any) => {
    const criada = getCriadaEm(r);
    if (!criada) return "—";

    const st = String(r?.status || "").toUpperCase();
    const assumida = getAssumidaEm(r);
    if (assumida) return fmtDuration(assumida - criada);

    if (st === "ABERTA") return fmtDuration(now - criada);

    const upd = getAtualizadaEm(r);
    if (upd && upd > criada) return fmtDuration(upd - criada);

    return "—";
  };

  /** Tempo de execução: do momento assumida até conclusão (ou agora, se em andamento) */
  const renderExecucao = (r: any) => {
    const assumida = getAssumidaEm(r) ?? (String(r?.status).toUpperCase() !== "ABERTA" ? getAtualizadaEm(r) : undefined);
    if (!assumida) return "—";

    const st = String(r?.status || "").toUpperCase();
    const fim = (st === "CONCLUIDA" || st === "CANCELADA") ? (getSaidaReal(r) ?? getAtualizadaEm(r) ?? now) : now;

    return fmtDuration((fim as number) - assumida);
  };

  const renderPrio = (p?: string | null) => {
    const key = (p || "").toUpperCase();
    const cls = prioClasses[key] ?? "";
    return p ? <Badge className={cls}>{key}</Badge> : "—";
  };

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="min-w-[64px]">#</TableHead>
              <TableHead className="min-w-[240px]">Descrição</TableHead>
              <TableHead className="min-w-[160px]">Cliente</TableHead>
              <TableHead className="min-w-[160px]">Veículo</TableHead>
              <TableHead className="min-w-[130px]">Status</TableHead>
              <TableHead className="min-w-[120px]">Prioridade</TableHead>
              <TableHead className="min-w-[120px]">Espera</TableHead>
              <TableHead className="min-w-[120px]">Execução</TableHead>
              <TableHead className="min-w-[160px] text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton && loading && (
              <TableSkeleton
                rows={8}
                columns={[
                  { cellClass: "min-w-[64px]",  barClass: "h-4 w-10" },
                  { cellClass: "min-w-[240px]", barClass: "h-4 w-56" },
                  { cellClass: "min-w-[160px]", barClass: "h-4 w-40" },
                  { cellClass: "min-w-[160px]", barClass: "h-4 w-44" },
                  { cellClass: "min-w-[130px]", barClass: "h-4 w-24" },
                  { cellClass: "min-w-[120px]", barClass: "h-4 w-20" },
                  { cellClass: "min-w-[120px]", barClass: "h-4 w-20" }, // Espera
                  { cellClass: "min-w-[120px]", barClass: "h-4 w-20" }, // Execução
                  { cellClass: "min-w-[160px]", barClass: "h-8 w-24 mx-auto" },
                ]}
              />
            )}

            {(!showSkeleton || !loading) &&
              sortedRows.map((r) => (
                <TableRow key={r.id} className={priorityRowClasses((r as any).prioridade)}>
                  <TableCell className="font-mono">{r.id}</TableCell>
                  <TableCell className="max-w-[420px] truncate">{r.descricao || "—"}</TableCell>
                  <TableCell>{(r as any).cliente?.nome ?? "—"}</TableCell>
                  <TableCell>
                    {r.veiculo ? `${(r as any).veiculo.modelo} • ${(r as any).veiculo.placa}` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusClasses[(r as any).status] ?? ""}>
                      {(r as any).status.replaceAll("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{renderPrio((r as any).prioridade)}</TableCell>
                  <TableCell>{renderEspera(r)}</TableCell>
                  <TableCell>{renderExecucao(r)}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => onDetalhes(r)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Detalhes
                        </DropdownMenuItem>

                        {(r as any).status === "ABERTA" && (
                          <DropdownMenuItem onClick={() => onAssumir(r)}>
                            <ClipboardCheck className="h-4 w-4 mr-2" />
                            Assumir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

            {empty && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  Nenhuma OS encontrada para seu setor.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Rodapé — modelo Customers */}
      <div className="flex items-center mt-4 justify-between">
        <div className="text-xs text-muted-foreground flex flex-nowrap">
          <span>{start || 0}</span> - <span>{end || 0}</span>
          <span className="ml-1 hidden sm:block">de {total}</span>
          <Loader className={`ml-2 w-4 h-full animate-spin transition-all opacity-0 ${loading && "opacity-100"}`} />
        </div>

        <div className="flex items-center justify-center space-x-1 sm:space-x-3">
          <Button
            variant="outline"
            size="icon"
            className="hover:cursor-pointer"
            onClick={() => onPaginate?.(1, limit)}
            disabled={page === 1 || !onPaginate}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hover:cursor-pointer"
            onClick={() => onPaginate?.(Math.max(1, page - 1), limit)}
            disabled={page === 1 || !onPaginate}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium text-nowrap">
            Pg. {page} de {totalPages || 1}
          </span>
          <Button
            className="hover:cursor-pointer"
            variant="outline"
            size="icon"
            onClick={() => onPaginate?.(Math.min(totalPages || 1, page + 1), limit)}
            disabled={page === (totalPages || 1) || !onPaginate || (totalPages || 1) === 0}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            className="hover:cursor-pointer"
            variant="outline"
            size="icon"
            onClick={() => onPaginate?.(totalPages || 1, limit)}
            disabled={page === (totalPages || 1) || !onPaginate || (totalPages || 1) === 0}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <Select
            value={String(limit)}
            onValueChange={(v) => {
              const newLimit = Number(v);
              onChangeLimit?.(newLimit);
              onPaginate?.(1, newLimit);
            }}
          >
            <SelectTrigger className="hover:cursor-pointer ml-2">
              <SelectValue placeholder={limit}></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
