"use client";
import { useEffect, useState } from "react";
import Cards from "./components/cards";
import FinancialTable from "./components/financialTable";
import Header from "./components/header";
import { StatusInfo, Tipo_transacao, Transaction } from "./types";
import axios from "axios";
import SearchFilter from "./components/searchFilter";

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
  const handleGetTransactions = async (
    pageNumber?: number,
    limit?: number,
    search?: string,
    tipo?: Tipo_transacao | ""
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/transaction", {
        params: {
          page: pageNumber || 1,
          limit: pagination.limit,
          search: search || undefined,
          tipo: tipo,
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

  useEffect(() => {
    handleGetTransactions(pagination.page, pagination.limit, search, tipo);
  }, [tipo, search]);

  useEffect(() => {
    handleGetTransactions(1, pagination.limit);
    handleGetStatusCounter();
  }, []);

  return (
    <div className="p-y-4 space-y-4">
      {/* <Header /> */}
      <Cards isLoadingStatus={isLoadingStatus} statusInfo={statusInfo} />
      <SearchFilter
        pagination={pagination}
        handleGetTransactions={handleGetTransactions}
        tipo={tipo}
        setSearch={setSearch}
        search={search}
        setTipo={setTipo}
      />
      <FinancialTable
        handleGetStatusCounter={handleGetStatusCounter}
        isLoading={isLoading}
        search={search}
        tipo={tipo}
        handleGetTransactions={handleGetTransactions}
        pagination={pagination}
        transactions={transactions}
      />
    </div>
  );
}
