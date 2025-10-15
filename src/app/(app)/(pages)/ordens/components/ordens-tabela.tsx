"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  Search,
  DollarSign,
  Loader,
  Car,
  PlusCircle,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@supabase/supabase-js";

import { Ordem, StatusOS } from "../types";
import TableSkeleton from "../components/table-skeleton";

// --------- Helpers de UI ---------
const statusClasses: Record<string, string> = {
  ABERTO: "bg-blue-600/15 text-blue-400",
  EM_ANDAMENTO: "bg-amber-600/15 text-amber-400",
  PAGAMENTO: "bg-indigo-600/15 text-indigo-400",
  CONCLUIDO: "bg-green-600/15 text-green-400",
  CANCELADO: "bg-red-600/15 text-red-400",
};

const prioClasses: Record<string, string> = {
  ALTA: "bg-red-600/15 text-red-500",
  NORMAL: "bg-amber-600/15 text-amber-500",
  BAIXA: "bg-emerald-600/15 text-emerald-500",
};

// --------- Helpers de tempo ---------
function fmtDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}
function toMs(s?: string | null): number | null {
  if (!s) return null;
  const t = new Date(s).getTime();
  return isNaN(t) ? null : t;
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
function useNowTick(periodMs = 60000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), periodMs);
    return () => clearInterval(id);
  }, [periodMs]);
  return now;
}

// alias local só para datas exibidas na tabela
type OrdemComDatas = Ordem & {
  dataEntrada?: string | null;
  dataSaida?: string | null;
  dataSaidaReal?: string | null;
  prioridade?: "ALTA" | "NORMAL" | "BAIXA" | null;
};

export function OrdensTabela({
  status,
  onOpenOrcamento,
  onEditar,
  onNovaOS,
}: {
  status: StatusOS;
  onOpenOrcamento: (row: OrdemComDatas) => void;
  onEditar: (row: OrdemComDatas) => void;
  onNovaOS: () => void;
}) {
  // dados
  const [rows, setRows] = useState<OrdemComDatas[]>([]);

  // paginação/filtro
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");

  // loading + guarda de request
  const [isLoading, setIsLoading] = useState(true);
  const reqIdRef = useRef(0);

  // tick para atualizar contador de tempo a cada 60s
  const now = useNowTick(60000);

  // params atuais para realtime
  const currentParamsRef = useRef({ status, q, page, limit });
  useEffect(() => {
    currentParamsRef.current = { status, q, page, limit };
  }, [status, q, page, limit]);

  async function fetchNow({
    status: st,
    q: search,
    page: pg,
    limit: lm,
  }: {
    status: StatusOS;
    q: string;
    page: number;
    limit: number;
  }) {
    const myId = ++reqIdRef.current;
    setIsLoading(true);
    try {
      const url = new URL("/api/ordens", window.location.origin);
      url.searchParams.set("status", st);
      if (search) url.searchParams.set("q", search);
      url.searchParams.set("page", String(pg));
      url.searchParams.set("limit", String(lm));

      const r = await fetch(url.toString(), { cache: "no-store" });
      const j = await r.json();

      if (myId !== reqIdRef.current) return;

      if (r.ok) {
        setRows(j.items ?? []);
        setTotalPages(j.totalPages ?? 1);
        setTotal(j.total ?? j.totalItems ?? 0);
      } else {
        console.error(j?.error || "Falha ao carregar");
        setRows([]);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (err: any) {
      if (myId !== reqIdRef.current) return;
      if (err?.name !== "AbortError") console.error(err);
      setRows([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      if (myId === reqIdRef.current) setIsLoading(false);
    }
  }

  // carregar quando filtros/paginação mudarem (com debounce simples para q)
  useEffect(() => {
    const t = setTimeout(() => fetchNow({ status, q, page, limit }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q, page, limit]);

  // reset página quando mudar status
  useEffect(() => {
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
      .on("postgres_changes", { event: "*", schema: "public", table: "ordemservico" }, () =>
        fetchNow(currentParamsRef.current)
      )
      .subscribe();

    const onLocalRefresh = () => fetchNow(currentParamsRef.current);
    window.addEventListener("os:refresh", onLocalRefresh);

    return () => {
      window.removeEventListener("os:refresh", onLocalRefresh);
      supabase.removeChannel(ch);
    };
  }, [status]);

  // rodapé
  const pageCount = rows.length;
  const start = limit * (page - 1) + (pageCount ? 1 : 0);
  const end = limit * (page - 1) + pageCount;

  const safeStatus = (s: Ordem["status"]) => (s ?? "ABERTO") as Exclude<StatusOS, "TODAS">;
  const renderTempo = (r: OrdemComDatas) => {
    const startMs =
      toMs(r.dataEntrada) ??
      toMs((r as any).createdat) ??
      toMs((r as any).createdAt) ??
      null;

    if (!startMs) return "—";

    const st = safeStatus(r.status);
    const endMs =
      st === "CONCLUIDO" || st === "CANCELADO"
        ? toMs(r.dataSaidaReal) ??
          toMs((r as any).updatedat) ??
          toMs((r as any).updatedAt) ??
          now
        : now;

    return fmtDuration((endMs ?? now) - startMs);
  };

  const renderPrio = (p?: OrdemComDatas["prioridade"]) => {
    const key = (p || "").toUpperCase();
    const cls = prioClasses[key] ?? "";
    return p ? <Badge className={cls}>{key}</Badge> : "—";
  };

  return (
    <Card className="bg-card">
      <CardContent className="p-3 sm:p-4">
        {/* filtro topo + botão Nova OS */}
        <div className="mb-3 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center justify-between">
          <div className="relative w-full sm:max-w-sm flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por descrição, cliente, veículo…"
              className="pl-8"
            />
          </div>

          <Button onClick={onNovaOS} className="whitespace-nowrap sm:self-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova OS
          </Button>
        </div>

        {/* tabela */}
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="min-w-[96px]">#</TableHead>
                <TableHead className="min-w-[240px]">Cliente / Veículo</TableHead>
                <TableHead className="min-w-[220px]">Descrição</TableHead>
                <TableHead className="min-w-[140px]">Setor</TableHead>
                <TableHead className="min-w-[130px]">Entrada</TableHead>
                <TableHead className="min-w-[130px]">Saída</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Prioridade</TableHead>
                <TableHead className="min-w-[120px]">Tempo</TableHead>
                <TableHead className="min-w-[160px] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && (
                <TableSkeleton
                  rows={8}
                  columns={[
                    { cellClass: "min-w-[96px]", barClass: "h-4 w-14" },   // #
                    { cellClass: "min-w-[240px]", barClass: "h-4 w-56" },  // Cliente / Veículo
                    { cellClass: "min-w-[220px]", barClass: "h-4 w-44" },  // Descrição
                    { cellClass: "min-w-[140px]", barClass: "h-4 w-28" },  // Setor
                    { cellClass: "min-w-[130px]", barClass: "h-4 w-28" },  // Entrada
                    { cellClass: "min-w-[130px]", barClass: "h-4 w-28" },  // Saída
                    { cellClass: "min-w-[120px]", barClass: "h-4 w-24" },  // Status
                    { cellClass: "min-w-[120px]", barClass: "h-4 w-20" },  // Prioridade
                    { cellClass: "min-w-[120px]", barClass: "h-4 w-20" },  // Tempo
                    { cellClass: "min-w-[160px]", barClass: "h-8 w-24" },  // Ações
                  ]}
                />
              )}

              {!isLoading &&
                rows.map((r) => {
                  const st = safeStatus(r.status);
                  const clienteNome = r.cliente?.nome ?? "—";
                  const veiculoStr = r.veiculo
                    ? `${r.veiculo.marca ?? ""} ${r.veiculo.modelo ?? ""} - ${r.veiculo.placa ?? ""}`.trim()
                    : "";

                  const canBudget = st === "CONCLUIDO"; // mude para: const canBudget = st === "CONCLUIDO" || st === "PAGAMENTO";

                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono">{r.id}</TableCell>

                      <TableCell className="min-w-0">
                        <div className="truncate font-medium text-[15px]">{clienteNome}</div>
                        {veiculoStr && (
                          <div className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                            <Car className="h-3 w-3 shrink-0" />
                            <span className="truncate">{veiculoStr}</span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="max-w-[380px] truncate">{r.descricao || "—"}</TableCell>
                      <TableCell>{r.setor?.nome ?? "—"}</TableCell>
                      <TableCell>{fmtDate(r.dataEntrada)}</TableCell>
                      <TableCell>{fmtDate(r.dataSaida)}</TableCell>
                      <TableCell>
                        <Badge className={statusClasses[st] ?? ""}>{st.replaceAll("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>{renderPrio(r.prioridade)}</TableCell>
                      <TableCell>{renderTempo(r)}</TableCell>

                      {/* Ações */}
                      <TableCell className="flex items-center justify-center gap-1 text-center">
                        <Button
                          size="sm"
                          onClick={() => onOpenOrcamento(r)}
                          disabled={!canBudget}
                          title={canBudget ? "Abrir orçamento" : "Disponível quando concluída"}
                          // Verde cheio quando disponível, discreto quando não
                          variant={canBudget ? "default" : "outline"}
                          className={
                            canBudget
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
                              : "bg-transparent"
                          }
                        >
                          <DollarSign className={`h-4 w-4 ${canBudget ? "text-white" : ""}`} />
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => onEditar(r)} title="Editar / Tramitar OS">
                          ✎
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!isLoading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                    Nenhuma OS encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Rodapé — mesmo visual */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-nowrap text-xs text-muted-foreground">
            <span>{start || 0}</span> - <span>{end || 0}</span>
            <span className="ml-1 hidden sm:block">de {total}</span>
            <Loader className={`ml-2 h-full w-4 animate-spin transition-all ${isLoading ? "opacity-100" : "opacity-0"}`} />
          </div>

          <div className="flex items-center justify-center space-x-1 sm:space-x-3">
            <Button variant="outline" size="icon" onClick={() => setPage(1)} disabled={page === 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-nowrap">
              Pg. {page} de {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(Math.min(totalPages || 1, page + 1))}
              disabled={page === totalPages || totalPages === 0}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(totalPages || 1)}
              disabled={page === totalPages || totalPages === 0}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Select
              value={String(limit)}
              onValueChange={(v) => {
                setPage(1);
                setLimit(Number(v));
              }}
            >
              <SelectTrigger className="ml-2 hover:cursor-pointer">
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
      </CardContent>
    </Card>
  );
}
