"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@supabase/supabase-js";

type StatusOS = "TODAS" | "ABERTA" | "EM_ANDAMENTO" | "AGUARDANDO_PECA" | "CONCLUIDA" | "CANCELADA";

type RowOS = {
  id: number;
  descricao: string;
  status: Exclude<StatusOS, "TODAS">;
  dataEntrada: string | null;
  dataSaidaPrevista: string | null;
  dataSaidaReal: string | null;
  cliente: { id: number; nome: string } | null;
  veiculo: { id: number; placa: string; modelo: string; marca: string } | null;
  setor: { id: number; nome: string } | null;
};

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

export function OrdensTabela({
  status,
  onOpenOrcamento,
  onEditar,
}: {
  status: StatusOS;
  onOpenOrcamento: (row: RowOS) => void;
  onEditar: (row: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<RowOS[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/ordens", window.location.origin);
      url.searchParams.set("status", status);
      if (q) url.searchParams.set("q", q);
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", String(limit));
      const r = await fetch(url.toString(), { cache: "no-store" });
      const j = await r.json();
      if (r.ok) {
        setRows(j.items ?? []);
        setTotalPages(j.totalPages ?? 1);
      } else {
        console.error(j?.error || "Falha ao carregar");
        setRows([]);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
    }
  };

  // carrega quando muda status/page/limit
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, limit]);

  // busca com debounce simples
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // Realtime para a tabela também (opcional)
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!url || !anon) return;

    const supabase = createClient(url, anon);
    const channel = supabase
      .channel(`os-realtime-list-${status}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ordemservico" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, limit, q]);

  const empty = !loading && rows.length === 0;

  return (
    <Card className="bg-card">
      <CardContent className="p-3 sm:p-4">
        {/* Filtros topo */}
        <div className="mb-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por descrição, cliente, veículo…"
              className="pl-8"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="min-w-[96px]">#</TableHead>
                <TableHead className="min-w-[220px]">Descrição</TableHead>
                <TableHead className="min-w-[160px]">Cliente</TableHead>
                <TableHead className="min-w-[160px]">Veículo</TableHead>
                <TableHead className="min-w-[140px]">Setor</TableHead>
                <TableHead className="min-w-[130px]">Entrada</TableHead>
                <TableHead className="min-w-[130px]">Prevista</TableHead>
                <TableHead className="min-w-[130px]">Saída</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[120px] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono">{r.id}</TableCell>
                  <TableCell className="max-w-[380px] truncate">{r.descricao || "—"}</TableCell>
                  <TableCell>{r.cliente?.nome ?? "—"}</TableCell>
                  <TableCell>{r.veiculo ? `${r.veiculo.modelo} • ${r.veiculo.placa}` : "—"}</TableCell>
                  <TableCell>{r.setor?.nome ?? "—"}</TableCell>
                  <TableCell>{fmtDate(r.dataEntrada)}</TableCell>
                  <TableCell>{fmtDate(r.dataSaidaPrevista)}</TableCell>
                  <TableCell>{fmtDate(r.dataSaidaReal)}</TableCell>
                  <TableCell>
                    <Badge className={statusClasses[r.status] ?? ""}>{r.status.replaceAll("_", " ")}</Badge>
                  </TableCell>
                  <TableCell className="text-center flex items-center justify-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenOrcamento(r)}
                      disabled={r.status !== "CONCLUIDA"}
                      title={r.status === "CONCLUIDA" ? "Abrir orçamento" : "Disponível quando concluída"}
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEditar(r)} title="Editar / Tramitar OS">
                      ✎ {/* ou um ícone Lucide */}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {empty && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                    Nenhuma OS encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Rodapé: Linhas por página (esq) | paginação (centro) */}
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">Linhas por página</span>
            <Select
              value={String(limit)}
              onValueChange={(v) => {
                setPage(1);
                setLimit(Number(v));
              }}
            >
              <SelectTrigger className="h-8 w-[84px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(1)} disabled={page <= 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
        </div>
      </CardContent>
    </Card>
  );
}
