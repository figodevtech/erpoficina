"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, ClipboardCheck } from "lucide-react";
import { RowOS } from "../types";

const statusClasses: Record<string, string> = {
  ABERTA: "bg-blue-600/15 text-blue-400",
  EM_ANDAMENTO: "bg-amber-600/15 text-amber-400",
  AGUARDANDO_PECA: "bg-purple-600/15 text-purple-400",
  CONCLUIDA: "bg-green-600/15 text-green-400",
  CANCELADA: "bg-red-600/15 text-red-400",
};

function TableSkeletonRow() {
  return (
    <TableRow>
      <TableCell className="min-w-[64px]"><Skeleton className="h-4 w-10" /></TableCell>
      <TableCell className="min-w-[240px]"><Skeleton className="h-4 w-56" /></TableCell>
      <TableCell className="min-w-[160px]"><Skeleton className="h-4 w-40" /></TableCell>
      <TableCell className="min-w-[160px]"><Skeleton className="h-4 w-44" /></TableCell>
      <TableCell className="min-w-[130px]"><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell className="min-w-[160px] text-center"><Skeleton className="h-8 w-24 mx-auto" /></TableCell>
    </TableRow>
  );
}

export default function EquipesTable({
  rows,
  loading,
  showSkeleton,
  onDetalhes,
  onAssumir,
  empty,
  page,
  totalPages,
  setPage,
}: {
  rows: RowOS[];
  loading: boolean;
  showSkeleton: boolean;
  empty: boolean;
  onDetalhes: (row: RowOS) => void;
  onAssumir: (row: RowOS) => void;
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
}) {
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
            {showSkeleton && loading && Array.from({ length: 8 }).map((_, i) => <TableSkeletonRow key={`s-${i}`} />)}

            {(!showSkeleton || !loading) &&
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono">{r.id}</TableCell>
                  <TableCell className="max-w-[420px] truncate">{r.descricao || "—"}</TableCell>
                  <TableCell>{r.cliente?.nome ?? "—"}</TableCell>
                  <TableCell>{r.veiculo ? `${r.veiculo.modelo} • ${r.veiculo.placa}` : "—"}</TableCell>
                  <TableCell>
                    <Badge className={statusClasses[r.status] ?? ""}>{r.status.replaceAll("_", " ")}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => onDetalhes(r)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                      {r.status === "ABERTA" && (
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

      {/* Paginação simples */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(1)} disabled={page <= 1}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="mx-2 text-sm">
          {page} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setPage(totalPages)}
          disabled={page >= totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
