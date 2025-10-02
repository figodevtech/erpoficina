"use client";

import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TableSkeleton from "../../../components/table-skeleton";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  ClipboardCheck,
  Loader,
} from "lucide-react";
import { RowOS } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusClasses: Record<string, string> = {
  ABERTA: "bg-blue-600/15 text-blue-400",
  EM_ANDAMENTO: "bg-amber-600/15 text-amber-400",
  AGUARDANDO_PECA: "bg-purple-600/15 text-purple-400",
  CONCLUIDA: "bg-green-600/15 text-green-400",
  CANCELADA: "bg-red-600/15 text-red-400",
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
  // Ordenação por prioridade e, dentro de cada grupo, mais antigas primeiro
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

  // Defaults seguros caso 'pagination' não venha
  const page = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const limit = pagination?.limit ?? 10;
  const total = pagination?.total ?? rows.length;
  const pageCount = pagination?.pageCount ?? rows.length;

  const start = limit * (page - 1) + (pageCount ? 1 : 0);
  const end = limit * (page - 1) + pageCount;

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
              <TableHead className="min-w-[160px] text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton && loading && (
              <TableSkeleton
                rows={8}
                columns={[
                  { cellClass: "min-w-[64px]", barClass: "h-4 w-10" },
                  { cellClass: "min-w-[240px]", barClass: "h-4 w-56" },
                  { cellClass: "min-w-[160px]", barClass: "h-4 w-40" },
                  { cellClass: "min-w-[160px]", barClass: "h-4 w-44" },
                  { cellClass: "min-w-[130px]", barClass: "h-4 w-24" },
                  { cellClass: "min-w-[160px] text-center", barClass: "h-8 w-24 mx-auto" },
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
                  <TableCell className="text-center">
                    <div className="inline-flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => onDetalhes(r)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                      {(r as any).status === "ABERTA" && (
                        <Button size="sm" onClick={() => onAssumir(r)}>
                          <ClipboardCheck className="h-4 w-4 mr-1" />
                          Assumir
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

            {empty && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Nenhuma OS encontrada para seu setor.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Rodapé — mesmo visual do Customers */}
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
              // atualiza o limit no pai
              onChangeLimit?.(newLimit);
              // garante reset para página 1 e refetch
              onPaginate?.(1, newLimit);
            }}
          >
            <SelectTrigger className="hover:cursor-pointer ml-2">
              <SelectValue placeholder={limit}></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="hover:cursor-pointer" value="10">
                10
              </SelectItem>
              <SelectItem className="hover:cursor-pointer" value="25">
                25
              </SelectItem>
              <SelectItem className="hover:cursor-pointer" value="50">
                50
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
