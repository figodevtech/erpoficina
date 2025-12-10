// ./src/app/(app)/(pages)/ordens/components/ordens-tabela.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  Loader,
  Loader2,
  Car,
  Plus,
  Package,
  AlertTriangle,
} from "lucide-react";

import { toast } from "sonner";

import type { StatusOS } from "./ordens-tabs";
import TableSkeleton from "../components/table-skeleton";
import { LinkAprovacaoDialog } from "./dialogs/link-aprovacao-dialog";
import { OSDetalhesDialog } from "./dialogs/detalhes-os-dialog";
import { ChecklistDialog } from "./dialogs/checklist-dialog";
import { statusClasses, prioClasses, fmtDate, fmtDuration, useNowTick, safeStatus } from "./ordens-utils";
import { RowActions } from "./row-actions";
import OsFinancialDialog from "../../(financeiro)/pagamentodeordens/components/osFinancialDialog/osFinancialDialog";
import OsStonePaymentDialog from "../../(financeiro)/pagamentodeordens/components/osStonePaymentDialog/osStonePaymentDialog";

import {
  OrdemComDatas,
  SortKey,
  SortDir,
  PrioFiltro,
  MAX_CLIENTE_CHARS,
  MAX_DESC_CHARS,
  normalizeDateDay,
  getTempoMs,
  SortableHeader,
  buildPolicy,
  prioRank,
} from "./ordens-tabela-helpers";
import { OrdensFilterSheet } from "./ordens-filtros";

// ------------------ COMPONENTE PRINCIPAL ------------------
export function OrdensTabela({
  statuses = [],
  search = "",
  onOpenOrcamento,
  onEditar,
  onNovaOS,
}: {
  statuses?: StatusOS[];
  search?: string;
  onOpenOrcamento: (row: OrdemComDatas) => void;
  onEditar: (row: OrdemComDatas) => void;
  onNovaOS: () => void;
}) {
  // dados
  const [rows, setRows] = useState<OrdemComDatas[]>([]);

  // paginação
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // ordenação (já começa por prioridade desc => ALTA no topo)
  const [sortKey, setSortKey] = useState<SortKey>("prioridade");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // filtros
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [prioFiltro, setPrioFiltro] = useState<PrioFiltro>("TODAS");
  const [dataInicio, setDataInicioState] = useState<Date | undefined>();
  const [dataFim, setDataFimState] = useState<Date | undefined>();

  // loading + guarda de request
  const [isLoading, setIsLoading] = useState(true);
  const reqIdRef = useRef(0);

  // tick para tempo correndo (5s)
  const now = useNowTick(5000);

  // params atuais p/ realtime
  const currentParamsRef = useRef({ statuses, search, page, limit });
  useEffect(() => {
    currentParamsRef.current = { statuses, search, page, limit };
  }, [statuses, search, page, limit]);

  async function fetchNow({
    statuses: sts,
    search: q,
    page: pg,
    limit: lm,
  }: {
    statuses: StatusOS[];
    search: string;
    page: number;
    limit: number;
  }) {
    const myId = ++reqIdRef.current;
    setIsLoading(true);
    try {
      const url = new URL("/api/ordens", window.location.origin);
      if (sts.length === 1) {
        url.searchParams.set("status", sts[0]);
      } else if (sts.length > 1) {
        url.searchParams.set("statuses", sts.join(","));
      }
      if (q) url.searchParams.set("q", q);
      url.searchParams.set("page", String(pg));
      url.searchParams.set("limit", String(lm));

      const r = await fetch(url.toString(), { cache: "no-store" });
      const j = await r.json();

      if (myId !== reqIdRef.current) return;

      if (r.ok) {
        let items: OrdemComDatas[] = j.items ?? [];
        if (sts.length > 0) {
          items = items.filter((row: OrdemComDatas) => sts.includes(safeStatus(row.status) as StatusOS));
        }
        setRows(items);
        setTotalPages(j.totalPages ?? 1);
        setTotal(j.total ?? j.totalItems ?? items.length);
      } else {
        toast.error(j?.error || "Falha ao carregar as ordens");
        setRows([]);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (err: any) {
      if (myId !== reqIdRef.current) return;
      if (err?.name !== "AbortError") toast.error(err?.message || "Erro ao carregar as ordens");
      setRows([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      if (myId === reqIdRef.current) setIsLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => fetchNow({ statuses, search, page, limit }), 300);
    return () => clearTimeout(t);
  }, [statuses, search, page, limit]);

  const statusesKey = useMemo(() => (statuses?.length ? statuses.join("|") : ""), [statuses]);

  useEffect(() => {
    setPage(1);
  }, [statusesKey]);

  // realtime via supabase
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!url || !anon) return;

    const supabase = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const suffix = statusesKey ? statusesKey.replace(/\|/g, "+") : "all";
    const channelName = `os-realtime-list-${suffix}`;
    const ch = supabase
      .channel(channelName)
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
  }, [statusesKey]);

  // rodapé
  const pageCount = rows.length;
  const start = limit * (page - 1) + (pageCount ? 1 : 0);
  const end = limit * (page - 1) + pageCount;

  const renderTempo = (r: OrdemComDatas) => {
    const ms = getTempoMs(r, now);
    if (!ms) return "—";
    return fmtDuration(ms);
  };

  // Estados de diálogos
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkRow, setLinkRow] = useState<OrdemComDatas | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<OrdemComDatas | null>(null);

  const [payOpen, setPayOpen] = useState(false);
  const [payRow, setPayRow] = useState<OrdemComDatas | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsId, setDetailsId] = useState<number | null>(null);

  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklistRow, setChecklistRow] = useState<OrdemComDatas | null>(null);

  const [stoneDialogOpen, setStoneDialogOpen] = useState(false);
  const [stoneDialogRow, setStoneDialogRow] = useState<OrdemComDatas | null>(null);

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveRow, setApproveRow] = useState<OrdemComDatas | null>(null);

  const [approvalToastId, setApprovalToastId] = useState<string | number | null>(null);

  const clearApprovalToast = () => {
    if (approvalToastId != null) {
      toast.dismiss(approvalToastId);
      setApprovalToastId(null);
    }
  };

  // ------- setStatus com checagem de responsáveis ao iniciar -------
  async function setStatus(id: number, status: StatusOS) {
    if (status === "EM_ANDAMENTO") {
      try {
        const r = await fetch(`/api/ordens/${id}`, {
          cache: "no-store",
        });
        const j = await r.json().catch(() => ({}));

        if (!r.ok) {
          throw new Error(j?.error || "Não foi possível validar responsáveis da OS.");
        }

        const itens = (j?.itensServico ?? []) as Array<{
          idusuariorealizador?: string | null;
        }>;

        const temSemResponsavel = itens.some((it) => !it.idusuariorealizador || it.idusuariorealizador === "");

        if (temSemResponsavel) {
          toast.error("Antes de iniciar, selecione o responsável para todos os serviços da OS.");
          setDetailsId(id);
          setDetailsOpen(true);
          return;
        }
      } catch (err: any) {
        console.error("Erro ao validar responsáveis:", err);
        toast.error(
          err?.message || "Não foi possível verificar os responsáveis. Abra os detalhes da OS para conferir."
        );
        setDetailsId(id);
        setDetailsOpen(true);
        return;
      }
    }

    const r = await fetch(`/api/ordens/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      toast.error(j?.error || "Falha ao atualizar status");
      return;
    }
    window.dispatchEvent(new CustomEvent("os:refresh"));
    toast.success("Status atualizado");
  }

  async function handleSendToApproval(row: OrdemComDatas) {
    // toast com spinner
    const id = toast(`Validando orçamento da OS #${row.id}...`, {
      duration: Infinity,
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
    });

    setApprovalToastId(id);

    try {
      const r = await fetch(`/api/ordens/${row.id}`, { cache: "no-store" });
      const j = await r.json().catch(() => ({}));

      if (!r.ok) {
        throw new Error(j?.error || "Não foi possível verificar o orçamento da OS.");
      }

      const itensServico = (j?.itensServico ?? []) as any[];
      const itensProduto = (j?.itensProduto ?? []) as any[];
      const totalItens = itensServico.length + itensProduto.length;

      if (totalItens === 0) {
        toast.error("O orçamento desta OS está vazio. Adicione ao menos 1 item antes de enviar para aprovação.", {
          id,
        });
        setApprovalToastId(null);
        return;
      }

      // Tem itens -> abre diálogo de confirmação
      setApproveRow(row);
      setApproveDialogOpen(true);

      // Atualiza texto do toast, mas mantém na tela até o usuário decidir
      toast("Orçamento validado. Revise e confirme o envio para aprovação.", {
        id,
        duration: Infinity,
      });
    } catch (err: any) {
      console.error("Erro ao validar orçamento:", err);

      toast.error(err?.message || "Não foi possível verificar o orçamento da OS.", {
        id,
      });
      setApprovalToastId(null);
    }
  }

  // garante regra: fim não pode ser antes do início, e vice-versa
  const handleSetDataInicio = (date?: Date) => {
    if (!date) {
      setDataInicioState(undefined);
      return;
    }
    if (dataFim && date > dataFim) {
      setDataFimState(date);
    }
    setDataInicioState(date);
  };

  const handleSetDataFim = (date?: Date) => {
    if (!date) {
      setDataFimState(undefined);
      return;
    }
    if (dataInicio && date < dataInicio) {
      setDataInicioState(date);
    }
    setDataFimState(date);
  };

  const handleLimparFiltros = () => {
    setPrioFiltro("TODAS");
    setDataInicioState(undefined);
    setDataFimState(undefined);
  };

  // ------- Filtro em memória (só na página atual) -------
  const filteredRows = useMemo(() => {
    const inicioDay = normalizeDateDay(dataInicio ?? null);
    const fimDay = normalizeDateDay(dataFim ?? null);

    return rows.filter((row) => {
      if (prioFiltro !== "TODAS") {
        const p = String(row.prioridade || "").toUpperCase();
        if (p !== prioFiltro) return false;
      }

      const entradaStr = (row as any).dataEntrada ?? (row as any).dataentrada ?? row.dataEntrada;

      if (inicioDay || fimDay) {
        if (!entradaStr) return false;
        const entradaDay = normalizeDateDay(entradaStr);
        if (!entradaDay) return false;

        if (inicioDay && entradaDay < inicioDay) return false;
        if (fimDay && entradaDay > fimDay) return false;
      }

      return true;
    });
  }, [rows, prioFiltro, dataInicio, dataFim]);

  // ------- Ordenação em memória -------
  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    const decorated = filteredRows.map((r, i) => ({ r, i })); // estável

    const compareStr = (a?: string | null, b?: string | null) =>
      (a || "—").localeCompare(b || "—", "pt-BR", {
        sensitivity: "base",
      });

    decorated.sort((a, b) => {
      let cmp = 0;
      const ra = a.r;
      const rb = b.r;

      switch (sortKey) {
        case "setor":
          cmp = compareStr(ra.setor?.nome, rb.setor?.nome);
          break;
        case "status":
          cmp = compareStr(safeStatus(ra.status), safeStatus(rb.status));
          break;
        case "entrada": {
          const da = normalizeDateDay((ra as any).dataEntrada ?? (ra as any).dataentrada)?.getTime() ?? 0;
          const db = normalizeDateDay((rb as any).dataEntrada ?? (rb as any).dataentrada)?.getTime() ?? 0;
          cmp = da - db;
          break;
        }
        case "saida": {
          const da = normalizeDateDay((ra as any).dataSaida ?? (ra as any).datasaida)?.getTime() ?? 0;
          const db = normalizeDateDay((rb as any).dataSaida ?? (rb as any).datasaida)?.getTime() ?? 0;
          cmp = da - db;
          break;
        }
        case "prioridade": {
          const pa = prioRank(ra.prioridade);
          const pb = prioRank(rb.prioridade);
          cmp = pa - pb;
          break;
        }
        case "tempo": {
          const ta = getTempoMs(ra, now);
          const tb = getTempoMs(rb, now);
          cmp = ta - tb;
          break;
        }
        default:
          cmp = 0;
      }

      if (cmp !== 0) return sortDir === "asc" ? cmp : -cmp;
      return a.i - b.i;
    });

    return decorated.map((d) => d.r);
  }, [filteredRows, sortKey, sortDir, now]);

  const handleSortChange = (key: SortKey, dir: SortDir) => {
    setSortKey(key);
    setSortDir(dir);
  };

  return (
    <TooltipProvider>
      <Card className="bg-card">
        <CardHeader className="border-b-2 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Ordens de Serviço</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <button
                  onClick={() => fetchNow(currentParamsRef.current)}
                  className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground/70"
                >
                  <span>Recarregar</span>
                  <Loader2 width={12} className={isLoading ? "animate-spin" : ""} />
                </button>
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <OrdensFilterSheet
                open={filtroAberto}
                onOpenChange={setFiltroAberto}
                prioFiltro={prioFiltro}
                setPrioFiltro={setPrioFiltro}
                dataInicio={dataInicio}
                dataFim={dataFim}
                onSetInicio={handleSetDataInicio}
                onSetFim={handleSetDataFim}
                onLimpar={handleLimparFiltros}
              />

              <Button onClick={onNovaOS} size="sm" className="hover:cursor-pointer">
                <Plus className="h-4 w-4 mr-1" />
                Nova OS
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4">
          {/* Tabela */}
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="min-w-[80px]">#</TableHead>
                  <TableHead className="min-w-[240px]">Cliente / Veículo</TableHead>
                  <TableHead className="min-w-[220px]">Descrição</TableHead>
                  <TableHead className="min-w-[140px]">
                    <SortableHeader
                      label="Setor"
                      columnKey="setor"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onChange={handleSortChange}
                    />
                  </TableHead>
                  <TableHead className="min-w-[130px]">
                    <SortableHeader
                      label="Entrada"
                      columnKey="entrada"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onChange={handleSortChange}
                    />
                  </TableHead>
                  <TableHead className="min-w-[130px]">
                    <SortableHeader
                      label="Saída"
                      columnKey="saida"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onChange={handleSortChange}
                    />
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <SortableHeader
                      label="Status"
                      columnKey="status"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onChange={handleSortChange}
                    />
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <SortableHeader
                      label="Prioridade"
                      columnKey="prioridade"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onChange={handleSortChange}
                    />
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <SortableHeader
                      label="Tempo"
                      columnKey="tempo"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onChange={handleSortChange}
                    />
                  </TableHead>
                  <TableHead className="min-w-[80px]" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading && (
                  <TableSkeleton
                    rows={8}
                    columns={[
                      { cellClass: "min-w-[80px]", barClass: "h-4 w-10" },
                      { cellClass: "min-w-[240px]", barClass: "h-4 w-56" },
                      { cellClass: "min-w-[220px]", barClass: "h-4 w-44" },
                      { cellClass: "min-w-[140px]", barClass: "h-4 w-28" },
                      { cellClass: "min-w-[130px]", barClass: "h-4 w-28" },
                      { cellClass: "min-w-[130px]", barClass: "h-4 w-28" },
                      { cellClass: "min-w-[120px]", barClass: "h-4 w-24" },
                      { cellClass: "min-w-[120px]", barClass: "h-4 w-20" },
                      { cellClass: "min-w-[120px]", barClass: "h-4 w-20" },
                      { cellClass: "min-w-[80px]", barClass: "h-8 w-6" },
                    ]}
                  />
                )}

                {!isLoading &&
                  sortedRows.map((r) => {
                    const st = safeStatus(r.status) as StatusOS;
                    const clienteNome = r.cliente?.nome ?? "—";

                    const clienteFull = clienteNome || "—";
                    const clienteShort =
                      clienteFull.length > MAX_CLIENTE_CHARS
                        ? `${clienteFull.slice(0, MAX_CLIENTE_CHARS - 1)}…`
                        : clienteFull;

                    const veiculoStr = r.veiculo
                      ? `${r.veiculo.marca ?? ""} ${r.veiculo.modelo ?? ""} - ${r.veiculo.placa ?? ""}`.trim()
                      : "";

                    const isPeca = (r as any).alvo_tipo === "PECA" || (r as any).alvoTipo === "PECA";

                    const pecaTitulo = (r as any)?.peca?.titulo as string | undefined;
                    const pecaDesc = (r as any)?.peca?.descricao as string | undefined;
                    const pecaStr = isPeca ? pecaTitulo || pecaDesc || "Peça" : "";

                    const alvoStr = isPeca ? pecaStr : veiculoStr;

                    const descFull = r.descricao || "—";
                    const descShort =
                      descFull.length > MAX_DESC_CHARS ? `${descFull.slice(0, MAX_DESC_CHARS - 1)}…` : descFull;

                    const policy = buildPolicy(st);

                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono">{r.id}</TableCell>

                        <TableCell className="min-w-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="truncate font-medium text-[15px]">{clienteShort}</div>
                            </TooltipTrigger>
                            {clienteFull.length > MAX_CLIENTE_CHARS && (
                              <TooltipContent>
                                <p className="max-w-xs break-words">{clienteFull}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>

                          {alvoStr && (
                            <div className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                              {isPeca ? <Package className="h-3 w-3 shrink-0" /> : <Car className="h-3 w-3 shrink-0" />}
                              <span className="truncate">{alvoStr}</span>
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="max-w-[380px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="truncate">{descShort}</div>
                            </TooltipTrigger>
                            {descFull.length > MAX_DESC_CHARS && (
                              <TooltipContent>
                                <p className="max-w-xs break-words">{descFull}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TableCell>

                        <TableCell>{r.setor?.nome ?? "—"}</TableCell>
                        <TableCell>{fmtDate((r as any).dataEntrada ?? (r as any).dataentrada)}</TableCell>
                        <TableCell>{fmtDate((r as any).dataSaida ?? (r as any).datasaida)}</TableCell>
                        <TableCell>
                          <Badge className={statusClasses[st] ?? ""}>{st.replaceAll("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          {r.prioridade ? (
                            <Badge className={prioClasses[(r.prioridade || "").toUpperCase()] ?? ""}>
                              {r.prioridade}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{renderTempo(r)}</TableCell>

                        <TableCell className="text-right">
                          <RowActions
                            row={r}
                            policy={policy}
                            onOpenOrcamento={onOpenOrcamento}
                            onEditar={onEditar}
                            setStatus={setStatus}
                            onSendToApproval={handleSendToApproval}
                            setLinkRow={setLinkRow}
                            setLinkDialogOpen={setLinkDialogOpen}
                            setConfirmRow={setConfirmRow}
                            setConfirmOpen={setConfirmOpen}
                            setPayRow={setPayRow}
                            setPayOpen={setPayOpen}
                            setDetailsId={setDetailsId}
                            setDetailsOpen={setDetailsOpen}
                            setChecklistRow={setChecklistRow}
                            setChecklistOpen={setChecklistOpen}
                            setStoneRow={setStoneDialogRow}
                            setStoneOpen={setStoneDialogOpen}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}

                {!isLoading && sortedRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                      Nenhuma OS encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Rodapé — paginação */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-nowrap text-xs text-muted-foreground">
              <span>{start || 0}</span> - <span>{end || 0}</span>
              <span className="ml-1 hidden sm:block">de {total}</span>
              <Loader
                className={`ml-2 h-full w-4 animate-spin transition-all ${isLoading ? "opacity-100" : "opacity-0"}`}
                aria-label="carregando"
              />
            </div>

            <div className="flex items-center justify-center space-x-1 sm:space-x-3">
              <Button
                variant="outline"
                size="icon"
                aria-label="Primeira página"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Página anterior"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium text-nowrap">
                Pg. {page} de {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                aria-label="Próxima página"
                onClick={() => setPage(Math.min(totalPages || 1, page + 1))}
                disabled={page === totalPages || totalPages === 0}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Última página"
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
                <SelectTrigger className="ml-2 hover:cursor-pointer" aria-label="Itens por página">
                  <SelectValue placeholder={limit} />
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

        {/* Dialog: Link de aprovação */}
        <LinkAprovacaoDialog
          open={linkDialogOpen}
          onOpenChange={(v) => {
            setLinkDialogOpen(v);
            if (!v) setLinkRow(null);
          }}
          osId={linkRow?.id ?? 0}
          clienteNome={linkRow?.cliente?.nome ?? null}
          clienteTelefone={linkRow?.cliente?.telefone}
        />

        {/* Alerta: enviar p/ pagamento */}
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Confirmar envio ao Financeiro
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação mudará o status da OS <b>#{confirmRow?.id}</b> para <b>PAGAMENTO</b>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!confirmRow) return;
                  await setStatus(confirmRow.id, "PAGAMENTO");
                  setConfirmOpen(false);
                  setConfirmRow(null);
                }}
              >
                Enviar p/ pagamento
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Alerta “Enviar para aprovação” */}
        <AlertDialog
          open={approveDialogOpen}
          onOpenChange={(open) => {
            setApproveDialogOpen(open);

            // se o dialog está fechando e ainda temos um toast "pendente", some com ele
            if (!open) {
              clearApprovalToast();
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Confira o orçamento antes de enviar para aprovação
              </AlertDialogTitle>
              <AlertDialogDescription>
                Ao confirmar, a OS <b>#{approveRow?.id}</b> irá alterar o status para <b>APROVACAO_ORCAMENTO</b>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>

              <AlertDialogAction
                onClick={async () => {
                  if (!approveRow) return;

                  if (approvalToastId != null) {
                    toast("Enviando orçamento para aprovação...", {
                      id: approvalToastId,
                    });
                  }

                  await setStatus(approveRow.id, "APROVACAO_ORCAMENTO");

                  if (approvalToastId != null) {
                    toast.success("Orçamento enviado para aprovação!", {
                      id: approvalToastId,
                      duration: 1000,
                    });
                    setApprovalToastId(null);
                  }

                  setApproveDialogOpen(false);
                  setApproveRow(null);
                }}
              >
                Enviar para aprovação
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog: Receber pagamento */}
        <OsFinancialDialog
          open={payOpen}
          onOpenChange={(v) => {
            setPayOpen(v);
            if (!v) setPayRow(null);
          }}
          osId={payRow?.id || 0}
          handleGetOrdens={() => fetchNow(currentParamsRef.current)}
        />

        {/* Dialog: Pagamento Stone */}
        <OsStonePaymentDialog
          open={stoneDialogOpen}
          onOpenChange={(v) => {
            setStoneDialogOpen(v);
            if (!v) setStoneDialogRow(null);
          }}
          osId={stoneDialogRow?.id || 0}
          handleGetOrdens={() => fetchNow(currentParamsRef.current)}
        />

        {/* Dialog: Detalhes */}
        <OSDetalhesDialog
          open={detailsOpen}
          onOpenChange={(v) => {
            setDetailsOpen(v);
            if (!v) setDetailsId(null);
          }}
          osId={detailsId ?? 0}
        />

        {/* Dialog: Checklist */}
        <ChecklistDialog
          open={checklistOpen}
          onOpenChange={(v) => {
            setChecklistOpen(v);
            if (!v) setChecklistRow(null);
          }}
          osId={checklistRow?.id ?? 0}
        />
      </Card>
    </TooltipProvider>
  );
}
