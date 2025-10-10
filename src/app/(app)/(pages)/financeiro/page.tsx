"use client"
import { useEffect, useState } from "react";
import Cards from "./components/cards";
import FinancialTable from "./components/financialTable";
import Header from "./components/header";
import {Tipo_transacao, transacao } from "./types";
import axios from "axios";
import SearchFilter from "./components/searchFilter";

export default function FinanceiroPage() {

    const [transactions, setTransactions] = useState<transacao[]>([]);
    const [isLoading, setIsLoading] = useState(false);
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

      useEffect(() => {
        handleGetTransactions(1, pagination.limit);
      }, []);

    return(
        <div className="p-y-4 space-y-4">
            {/* <Header /> */}
            <Cards />
            <SearchFilter
                tipo={tipo}
                setSearch={setSearch}
                search={search}
                setTipo={setTipo}
                />
            <FinancialTable
            search={search}
            tipo={tipo}
            handleGetTransactions={handleGetTransactions}
            pagination={pagination}
            transactions={transactions}
            />
        </div>
    )
}