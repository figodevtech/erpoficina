"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { StatusInfo, Tipo_transacao, Transaction } from "./types";
import Cards from "./components/cards";
import SearchFilter from "./components/searchFilter";
import FinancialTable from "./components/financialTable";

type FluxoViewMode = "TODAS" | "A_RECEBER" | "A_PAGAR";

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [statusInfo, setStatusInfo] = useState<StatusInfo | undefined>(
    undefined
  );
  const [tipo, setTipo] = useState<Tipo_transacao | "">("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [viewMode, setViewMode] = useState<FluxoViewMode>("TODAS");
  const handleGetTransactions = async (
    pageNumber?: number,
    limit?: number,
    search?: string,
    dateFrom?: string,
    dateTo?: string,
    tipo?: Tipo_transacao | "",
    pendente?: boolean | ""
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/transaction", {
        params: {
          page: pageNumber || 1,
          limit: pagination.limit,
          search: search || undefined,
          tipo: tipo,
          pendente: pendente === "" ? undefined : pendente,
          dateFrom: dateFrom,
          dateTo: dateTo,
        },
      });
      if (response.status === 200) {
        // console.log(response)
        const { data } = response;
        setTransactions(data.data);
        setPagination(data.pagination);
        console.log("Transações carregadas:", data.data);
      }
    } catch (error) {
      console.log("Erro ao buscar Transações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStatusCounter = async () => {
    setIsLoadingStatus(true);
    try {
      const response = await axios.get("/api/transaction/status-counter", {});
      const response2 = await axios.get("/api/transaction/status-counter", {
        params: { offset: -1 },
      });
      if (response.status === 200 && response2.status === 200) {
        // console.log(response)
        setStatusInfo({
          ...statusInfo,
          mesAtual: response.data,
          mesAnterior: response2.data,
        });
        console.log("Status Carregado, mês atual:", response.data);
        console.log("Status Carregado, mês anterior:", response2.data);
      }
    } catch (error) {
      console.log("Erro ao buscar Status:", error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const effectiveTipo =
    viewMode === "A_RECEBER"
      ? Tipo_transacao.RECEITA
      : viewMode === "A_PAGAR"
      ? Tipo_transacao.DESPESA
      : tipo;

  const effectivePendente =
    viewMode === "TODAS" ? "" : true;

  useEffect(() => {
    handleGetTransactions(
      1,
      pagination.limit,
      search,
      dateFrom,
      dateTo,
      effectiveTipo,
      effectivePendente,
    );
  }, [tipo, search, dateFrom, dateTo, viewMode]);

  useEffect(() => {
    if (viewMode !== "TODAS" && tipo) {
      setTipo("");
    }
  }, [viewMode]);

  useEffect(() => {
    handleGetTransactions(1, pagination.limit, search, dateFrom, dateTo, effectiveTipo, effectivePendente);
    handleGetStatusCounter();
  }, []);

  return (
    <div className="p-y-4 space-y-4">
      {/* <Header /> */}
      <Cards isLoadingStatus={isLoadingStatus} statusInfo={statusInfo} />
      <FinancialTable
        dateFrom={dateFrom}
        dateTo={dateTo}
        handleGetStatusCounter={handleGetStatusCounter}
        isLoading={isLoading}
        search={search}
        tipo={effectiveTipo}
        pendenteFilter={effectivePendente}
        viewMode={viewMode}
        rawTipo={tipo}
        setTipo={setTipo}
        setSearch={setSearch}
        dateSearch={search}
        setDateFrom={setDateFrom}
        setDateTo={setDateTo}
        setViewMode={setViewMode}
        handleGetTransactions={handleGetTransactions}
        pagination={pagination}
        transactions={transactions}
      />
    </div>
  );
}
