"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  Loader,
  Loader2,
  Car,
  AlertTriangle,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Plus,
  Package,
} from "lucide-react";
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
import { toast } from "sonner";
import { Ordem } from "../types";
import type { StatusOS } from "./ordens-tabs";
import TableSkeleton from "../components/table-skeleton";
import { LinkAprovacaoDialog } from "./dialogs/link-aprovacao-dialog";
import { OSDetalhesDialog } from "./dialogs/detalhes-os-dialog";
import { ChecklistDialog } from "./dialogs/checklist-dialog";
// utils & helpers
import { statusClasses, prioClasses, fmtDate, fmtDuration, toMs, useNowTick, safeStatus } from "./ordens-utils";
import { RowActions } from "./row-actions";
import OsFinancialDialog from "../../(financeiro)/pagamentodeordens/components/osFinancialDialog/osFinancialDialog";

// ---- Tipos locais (datas amigas p/ tabela)
type OrdemComDatas = Ordem & {
  dataEntrada?: string | null;
  dataSaida?: string | null;
  dataSaidaReal?: string | null;
  prioridade?: "ALTA" | "NORMAL" | "BAIXA" | null;
};

// ---- Ordenação (apenas prioridade)
type SortKey = "prioridade" | null;
type SortDir = "asc" | "desc";

// mapeia prioridade para número (para ordenar)
const prioRank = (p?: OrdemComDatas["prioridade"]) => {
  const key = String(p || "").toUpperCase();
  if (key === "ALTA") return 3;
  if (key === "NORMAL") return 2;
  if (key === "BAIXA") return 1;
  return 0;
};

export function OrdensTabela({
  statuses = [],
  search = "",
  onOpenOrcamento,
  onEditar,
  onNovaOS,
}: {
  /** múltiplos status aceitos na aba atual */
  statuses?: StatusOS[];
  /** termo de busca, controlado fora (separado da tabela) */
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

  // ordenação
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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
        // backend pode aceitar csv: ?statuses=A,B
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
        // filtro defensivo no client caso backend não suporte "statuses"
        if (sts.length > 0) {
          items = items.filter((row) => sts.includes(safeStatus(row.status) as StatusOS));
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

  // carregar quando filtros/paginação mudarem (debounce simples do search)
  useEffect(() => {
    const t = setTimeout(() => fetchNow({ statuses, search, page, limit }), 300);
    return () => clearTimeout(t);
  }, [statuses, search, page, limit]);

  const statusesKey = useMemo(() => (statuses?.length ? statuses.join("|") : ""), [statuses]);

  // reset página quando mudar conjunto de status
  useEffect(() => {
    setPage(1);
  }, [statusesKey]);

  // realtime via supabase
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!url || !anon) return;

    const supabase = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
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
    const startMs = toMs(r.dataEntrada) ?? toMs((r as any).createdat) ?? toMs((r as any).createdAt) ?? null;
    if (!startMs) return "—";

    const st = safeStatus(r.status);
    const endMs =
      st === "CONCLUIDO" || st === "CANCELADO"
        ? toMs(r.dataSaidaReal) ?? toMs((r as any).updatedat) ?? toMs((r as any).updatedAt) ?? now
        : now;

    return fmtDuration((endMs ?? now) - startMs);
  };

  async function setStatus(id: number, status: StatusOS) {
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

  async function deleteOS(id: number) {
    try {
      const r = await fetch(`/api/ordens/${id}`, { method: "DELETE" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Falha ao excluir OS");
      toast.success(`OS #${id} excluída`);
      window.dispatchEvent(new CustomEvent("os:refresh"));
    } catch (e: any) {
      toast.error(e?.message || "Erro ao excluir OS");
    }
  }

  // Estados de diálogos
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkRow, setLinkRow] = useState<OrdemComDatas | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<OrdemComDatas | null>(null);

  const [payOpen, setPayOpen] = useState(false);
  const [payRow, setPayRow] = useState<OrdemComDatas | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsId, setDetailsId] = useState<number | null>(null);

  const [delOpen, setDelOpen] = useState(false);
  const [delRow, setDelRow] = useState<OrdemComDatas | null>(null);

  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklistRow, setChecklistRow] = useState<OrdemComDatas | null>(null);

  // ------- Ordenação em memória (só na página atual)
  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const decorated = rows.map((r, i) => ({ r, i })); // estável
    if (sortKey === "prioridade") {
      decorated.sort((a, b) => {
        const pa = prioRank(a.r.prioridade);
        const pb = prioRank(b.r.prioridade);
        const cmp = pa - pb;
        if (cmp !== 0) return sortDir === "asc" ? cmp : -cmp;
        return a.i - b.i; // estável
      });
    }
    return decorated.map((d) => d.r);
  }, [rows, sortKey, sortDir]);

  // Cabeçalho Prioridade clicável
  const PrioridadeHeader = () => {
    const icon = !sortKey ? (
      <ChevronsUpDown className="ml-1 h-3.5 w-3.5 opacity-60" />
    ) : sortKey === "prioridade" && sortDir === "asc" ? (
      <ChevronUp className="ml-1 h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="ml-1 h-3.5 w-3.5" />
    );

    const handleClick = () => {
      // ciclo: none -> desc -> asc -> none
      if (!sortKey) {
        setSortKey("prioridade");
        setSortDir("desc");
      } else if (sortKey === "prioridade" && sortDir === "desc") {
        setSortDir("asc");
      } else {
        setSortKey(null);
      }
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center select-none cursor-pointer"
        title="Ordenar por prioridade"
      >
        Prioridade
        {icon}
      </button>
    );
  };

  return (
    <Card className="bg-card">
      {/* Header padronizado + refresh no próprio card */}
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
                <TableHead className="min-w-[96px]">#</TableHead>
                <TableHead className="min-w-[240px]">Cliente / Veículo</TableHead>
                <TableHead className="min-w-[220px]">Descrição</TableHead>
                <TableHead className="min-w-[140px]">Setor</TableHead>
                <TableHead className="min-w-[130px]">Entrada</TableHead>
                <TableHead className="min-w-[130px]">Saída</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[120px]">
                  <PrioridadeHeader />
                </TableHead>
                <TableHead className="min-w-[120px]">Tempo</TableHead>
                <TableHead className="min-w-[80px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && (
                <TableSkeleton
                  rows={8}
                  columns={[
                    { cellClass: "min-w-[96px]", barClass: "h-4 w-14" },
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

                  // VEÍCULO
                  const veiculoStr = r.veiculo
                    ? `${r.veiculo.marca ?? ""} ${r.veiculo.modelo ?? ""} - ${r.veiculo.placa ?? ""}`.trim()
                    : "";

                  // PEÇA
                  const isPeca = (r as any).alvo_tipo === "PECA" || (r as any).alvoTipo === "PECA";

                  const pecaTitulo = (r as any)?.peca?.titulo as string | undefined;
                  const pecaDesc = (r as any)?.peca?.descricao as string | undefined;
                  const pecaStr = isPeca ? pecaTitulo || pecaDesc || "Peça" : "";

                  // O que vamos exibir como “linha de baixo”
                  const alvoStr = isPeca ? pecaStr : veiculoStr;

                  // Regras de visibilidade consolidada
                  const policy = {
                    // pode editar orçamento (tela de orçamento) em ORCAMENTO ou ORCAMENTO_RECUSADO
                    canEditBudget: st === "ORCAMENTO" || st === "ORCAMENTO_RECUSADO",
                    showEditOS: st === "ORCAMENTO",
                    showLinkAprov:
                      st === "ORCAMENTO" || st === "APROVACAO_ORCAMENTO",
                    showCancelBudget: st === "APROVACAO_ORCAMENTO",
                    showApproveBudget: st === "APROVACAO_ORCAMENTO",
                    showRejectBudget: st === "APROVACAO_ORCAMENTO",
                    // NOVO: botão "Enviar para aprovação" em ORCAMENTO e ORCAMENTO_RECUSADO
                    showSendToApproval: st === "ORCAMENTO" || st === "ORCAMENTO_RECUSADO",
                    showStart: st === "ORCAMENTO_APROVADO",
                    showSendToPayment: st === "EM_ANDAMENTO",
                    showReceivePayment: st === "PAGAMENTO",
                  };

                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono">{r.id}</TableCell>

                      <TableCell className="min-w-0">
                        <div className="truncate font-medium text-[15px]">{clienteNome}</div>

                        {alvoStr && (
                          <div className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                            {isPeca ? <Package className="h-3 w-3 shrink-0" /> : <Car className="h-3 w-3 shrink-0" />}
                            <span className="truncate">{alvoStr}</span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="max-w-[380px] truncate">{r.descricao || "—"}</TableCell>
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
                          setLinkRow={setLinkRow}
                          setLinkDialogOpen={setLinkDialogOpen}
                          setConfirmRow={setConfirmRow}
                          setConfirmOpen={setConfirmOpen}
                          setPayRow={setPayRow}
                          setPayOpen={setPayOpen}
                          setDetailsId={setDetailsId}
                          setDetailsOpen={setDetailsOpen}
                          setDelRow={setDelRow}
                          setDelOpen={setDelOpen}
                          setChecklistRow={setChecklistRow}
                          setChecklistOpen={setChecklistOpen}
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

      {/* Alerta: Excluir OS */}
      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">Excluir OS #{delRow?.id}</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação é irreversível. Tem certeza que deseja excluir a OS <b>#{delRow?.id}</b>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!delRow) return;
                await deleteOS(delRow.id);
                setDelOpen(false);
                setDelRow(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
