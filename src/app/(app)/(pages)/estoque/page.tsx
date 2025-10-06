"use client";

import { useEffect, useState } from "react";

import { Produto, Pagination, Estoque_status } from "./types";
import axios from "axios";
import useStatusCounter from "./hooks/status-counter";
import Header from "./components/header";
import Cards from "./components/cards";
import SearchFilter from "./components/searchFilter";
import ProductsDataTable from "./components/products-data-table";

// 🔎 Deriva status a partir de estoque x estoque mínimo

export default function EstoquePage() {
  const [status, setStatus] = useState<Estoque_status>(Estoque_status.TODOS);
  const [products, setProducts] = useState<Produto[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<
    number | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const {
    statusCounts,
    loadingStatusCounter,
    totalProducts,
    error,
    fetchStatusCounts,
  } = useStatusCounter();
  const [isOpen, setIsOpen] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");

  const handleGetProducts = async (
    pageNumber?: number,
    limit?: number,
    search?: string,
    status?: Estoque_status
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/products", {
        params: {
          page: pageNumber || 1,
          limit: pagination.limit,
          search: search || undefined,
          status: status || "TODOS",
        },
      });
      if (response.status === 200) {
        // console.log(response)
        const { data } = response;
        setProducts(data.data);
        setPagination(data.pagination);
        console.log("Produtos carregados:", data.data);
      }
    } catch (error) {
      console.log("Erro ao buscar Produtos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetProducts(1, pagination.limit, search, status);
  }, []);

  useEffect(() => {
    handleGetProducts(1, pagination.limit, search, status);
  }, [search, status]);

  useEffect(() => {
    if (selectedProductId) {
      setIsOpen(true);
    }
  }, [selectedProductId]);

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}

      <Header
        setSelectedProductId={setSelectedProductId}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        selectedProductId={selectedProductId}
      />

      {/* KPI Cards */}

      <Cards
        loadingStatusCounter={loadingStatusCounter}
        statusCounts={statusCounts}
        totalProducts={totalProducts}
      />

      {/* Search / Filtros */}

      <SearchFilter
        search={search}
        setSearch={setSearch}
        setStatus={setStatus}
        status={status}
      />
      {/* Tabela de Produtos */}
      <ProductsDataTable
        setSelectedProductId={setSelectedProductId}
        fetchStatusCounts={fetchStatusCounts}
        handleGetProducts={handleGetProducts}
        isLoading={isLoading}
        products={products}
        pagination={pagination}
        search={search}
        status={status}
      />
    </div>
  );
}
