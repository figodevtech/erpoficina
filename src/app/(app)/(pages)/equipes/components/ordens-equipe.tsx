"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import EquipesFilters from "./equipe-filtro";
import EquipesTable from "./equipe-tabela";
import EquipesDetailsDialog from "./details-dialog";
import { RowOS, StatusOS } from "../types";
import { assumirOS, listarOrdensEquipe } from "../lib/api";
import { createClient } from "@supabase/supabase-js";

export default function EquipesClient({ setorId, setorNome }: { setorId: number; setorNome: string }) {
  const [status, setStatus] = useState<StatusOS>("ABERTA");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<RowOS[]>([]);

  // paginação
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  // estado de loading/skeleton
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  // dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(
    async (p: number = page, l: number = limit) => {
      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setLoading(true);
      try {
        const {
          items,
          totalPages: tp,
          total: t,
        } = await listarOrdensEquipe({
          status,
          q,
          page: p,
          limit: l,
        });

        setRows(items ?? []);
        setTotalPages(tp ?? 1);
        setTotal(typeof t === "number" ? t : 0);
        setPageCount(items?.length ?? 0);
      } catch (e) {
        console.error(e);
        setRows([]);
        setTotalPages(1);
        setTotal(0);
        setPageCount(0);
      } finally {
        setLoading(false);
        setHasLoaded(true);
        setShowSkeleton(false);
      }
    },
    [status, q, page, limit]
  );

  const refetchSoon = useCallback(() => {
    if (refetchTimer.current) return;
    refetchTimer.current = setTimeout(() => {
      refetchTimer.current = null;
      fetchData();
    }, 200);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // debounce busca
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchData(1, limit);
    }, 400);
    return () => clearTimeout(t);
  }, [q, limit, fetchData]);

  // quando mudar o status, mostra skeleton de novo e volta p/ página 1
  useEffect(() => {
    setShowSkeleton(true);
    setPage(1);
    fetchData(1, limit);
  }, [status]); // fetchData já depende de status

  // realtime filtrado pelo setor
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!url || !anon) return;

    const supabase = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
    const ch = supabase
      .channel(`equipes-os-${setorId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ordemservico", filter: `setorid=eq.${setorId}` },
        () => refetchSoon()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [setorId, refetchSoon]);

  const empty = hasLoaded && !loading && rows.length === 0;

  // ações
  const handleDetalhes = (row: RowOS) => {
    setSelectedId(row.id);
    setDialogOpen(true);
  };

  const handleAssumir = async (row: RowOS) => {
    try {
      await assumirOS(row.id);
      refetchSoon();
    } catch (e) {
      console.error(e);
      alert((e as any)?.message ?? "Falha ao assumir OS");
    }
  };

  // handlers de paginação no modelo Customers
  const onPaginate = (newPage: number, newLimit: number) => {
    setPage(newPage);
    setLimit(newLimit);
    fetchData(newPage, newLimit);
  };

  const onChangeLimit = (newLimit: number) => {
    setPage(1);
    setLimit(newLimit);
    fetchData(1, newLimit);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Minha Equipe</h1>
        <div className="text-sm text-muted-foreground">Setor #{setorNome}</div>
      </div>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <EquipesFilters status={status} onStatusChange={setStatus} q={q} onQueryChange={setQ} />

          <div className="mt-4">
            <EquipesTable
              rows={rows}
              loading={loading}
              showSkeleton={showSkeleton}
              empty={empty}
              onDetalhes={handleDetalhes}
              onAssumir={handleAssumir}
              pagination={{
                page,
                totalPages,
                limit,
                total,
                pageCount,
              }}
              onPaginate={onPaginate}
              onChangeLimit={onChangeLimit}
            />
          </div>
        </CardContent>
      </Card>

      <EquipesDetailsDialog osId={selectedId} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
