"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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

function TableSkeletonRow() {
  return (
    <TableRow>
      <TableCell className="min-w-[96px]"><Skeleton className="h-4 w-14" /></TableCell>
      <TableCell className="min-w-[220px]"><Skeleton className="h-4 w-56" /></TableCell>
      <TableCell className="min-w-[160px]"><Skeleton className="h-4 w-40" /></TableCell>
      <TableCell className="min-w-[160px]"><Skeleton className="h-4 w-44" /></TableCell>
      <TableCell className="min-w-[140px]"><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell className="min-w-[130px]"><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell className="min-w-[130px]"><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell className="min-w-[130px]"><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell className="min-w-[120px]"><Skeleton className="h-6 w-24" /></TableCell>
      <TableCell className="min-w-[120px]"><Skeleton className="h-8 w-20" /></TableCell>
    </TableRow>
  );
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
  /** loading: está buscando agora */
  const [loading, setLoading] = useState(true);
  /** hasLoaded: pelo menos um fetch já terminou (com sucesso ou erro) */
  const [hasLoaded, setHasLoaded] = useState(false);
  /** showSkeleton: mostra skeleton no primeiro load e quando mudar de aba (status) */
  const [showSkeleton, setShowSkeleton] = useState(true);

  const [rows, setRows] = useState<RowOS[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    try {
      const url = new URL("/api/ordens", window.location.origin);
      url.searchParams.set("status", status);
      if (q) url.searchParams.set("q", q);
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", String(limit));

      const r = await fetch(url.toString(), { cache: "no-store", signal: ac.signal });
      const j = await r.json();
      if (r.ok) {
        setRows(j.items ?? []);
        setTotalPages(j.totalPages ?? 1);
      } else {
        console.error(j?.error || "Falha ao carregar");
        setRows([]);
        setTotalPages(1);
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error(err);
    } finally {
      setLoading(false);
      setHasLoaded(true);
      setShowSkeleton(false); // terminou (primeiro load ou troca de aba)
    }
  }, [status, q, page, limit]);

  const refetchSoon = useCallback(() => {
    if (refetchTimer.current) return;
    refetchTimer.current = setTimeout(() => {
      refetchTimer.current = null;
      fetchData();
    }, 250);
  }, [fetchData]);

  // primeiro load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // busca com debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(t);
  }, [q, fetchData]);

  // ao trocar de aba (status), mostra skeleton novamente
  useEffect(() => {
    setShowSkeleton(true);
    setPage(1);
  }, [status]);

  // realtime
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!url || !anon) return;

    const supabase = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
    const ch = supabase
      .channel(`os-realtime-list-${status}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ordemservico" }, () => refetchSoon())
      // .on("postgres_changes", { event: "*", schema: "public", table: "osproduto" }, () => refetchSoon())
      // .on("postgres_changes", { event: "*", schema: "public", table: "osservico" }, () => refetchSoon())
      // .on("postgres_changes", { event: "*", schema: "public", table: "pagamento" }, () => refetchSoon())
      .subscribe();

    const onLocalRefresh = () => refetchSoon();
    window.addEventListener("os:refresh", onLocalRefresh);

    return () => {
      window.removeEventListener("os:refresh", onLocalRefresh);
      supabase.removeChannel(ch);
    };
  }, [status, refetchSoon]);

  /** Só mostra “vazio” depois do primeiro carregamento terminar */
  const empty = hasLoaded && !loading && rows.length === 0;

  return (
    <Card className="bg-card">
      <CardContent className="p-3 sm:p-4">
        {/* Barra de carregamento */}
        <div className="mb-3">{loading ? <Skeleton className="h-1 w-full" /> : <div className="h-1 w-full" />}</div>

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
              {/* Skeletons: primeiro load e quando muda a aba */}
              {showSkeleton && loading && Array.from({ length: 8 }).map((_, i) => <TableSkeletonRow key={`s-${i}`} />)}

              {/* Linhas reais (também aparecem durante loading em atualizações de fundo) */}
              {(!showSkeleton || !loading) &&
                rows.map((r) => (
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
                        ✎
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

              {/* Vazio (só depois do primeiro fetch) */}
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
