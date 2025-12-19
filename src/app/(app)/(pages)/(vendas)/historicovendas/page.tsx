"use client";
"use cliente";
import { useEffect, useState } from "react";
import Cards from "./components/cards";
import axios from "axios";
import {
  Pagination,
  VendaComItens,
  vendaStatus,
  VendaStatusMetricsData,
} from "./types";
import VendasDataTable from "./components/vendas-data-table";

function formatMonthFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 0-11 -> 1-12
  return `${year}-${month}`;
}
export default function HistoricoVendas() {
  const [loadingStatusCounter, setLoadingStatusCounter] = useState(false);
  const [status, setStatus] = useState<vendaStatus | "TODOS">("TODOS");

  const totalVendas = 0;
  const [data, setData] = useState<VendaStatusMetricsData | null>(null);
  const [vendas, setVendas] = useState<VendaComItens[]>([]);
  const date = new Date(); // hoje
  const month = formatMonthFromDate(date);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVendaId, setSelectedVendaId] = useState<number | undefined>(
    undefined
  );
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");

  const handleGetVendas = async (
    pageNumber?: number,
    limit?: number,
    searchText?: string,
    statusValue?: vendaStatus | "TODOS"
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/venda", {
        params: {
          page: pageNumber || 1,
          limit: pagination.limit,
          search: searchText || undefined,
          status: statusValue || "TODOS",
        },
      });
      if (response.status === 200) {
        const { data } = response;
        setVendas(data.data);
        setPagination(data.pagination);
        console.log("Vendas carregadas:", data.data);
      }
    } catch (error) {
      console.log("Erro ao buscar Vendas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  async function fetchMetrics() {
    try {
      setLoadingStatusCounter(true);

      const url = month
        ? `/api/venda/status-counter?month=${month}`
        : `/api/venda/status-counter`;

      const res = await axios.get(url);

      setData(res.data.data); // o payload vem como {data: {...}}
    } catch (err: any) {
    } finally {
      setLoadingStatusCounter(false);
    }
  }

  useEffect(() => {
    handleGetVendas(1, pagination.limit, search, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    fetchMetrics();
  }, [, month]);

  return (
    <div className="mx-auto space-y-6">
      <Cards
        loadingStatusCounter={loadingStatusCounter}
        totalVendas={totalVendas}
        statusCounts={data}
      />
      <VendasDataTable
        handleGetVendas={handleGetVendas}
        isLoading={isLoading}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        fetchStatusCounts={fetchMetrics}
        pagination={pagination}
        search={search}
        selectedVendaId={selectedVendaId}
        setSelectedVendaId={setSelectedVendaId}
        status={status}
        vendas={vendas}
      />
    </div>
  );
}
