"use client";

import { useEffect, useState } from "react";
import { Produto, Pagination, Estoque_status } from "./types";
import axios from "axios";
import useStatusCounter from "./hooks/status-counter";

// ❌ Removido: header local
// import Header from "./components/header";

import Cards from "./components/cards";
import SearchFilter from "./components/searchFilter";
import ProductsDataTable from "./components/products-data-table";

export default function EstoquePage() {
  const [status, setStatus] = useState<Estoque_status>(Estoque_status.TODOS);
  const [products, setProducts] = useState<Produto[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const {
    statusCounts,
    loadingStatusCounter,
    totalProducts,
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
    searchText?: string,
    statusValue?: Estoque_status
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/products", {
        params: {
          page: pageNumber || 1,
          limit: pagination.limit,
          search: searchText || undefined,
          status: statusValue || "TODOS",
        },
      });
      if (response.status === 200) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleGetProducts(1, pagination.limit, search, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  // ✅ Mantém o duplo clique abrindo o diálogo de edição
  useEffect(() => {
    if (selectedProductId) {
      setIsOpen(true);
    }
  }, [selectedProductId]);

  return (
    <div className="mx-auto space-y-6">
      {/* ✅ Header local removido (há um header global) */}

      <Cards
        loadingStatusCounter={loadingStatusCounter}
        statusCounts={statusCounts}
        totalProducts={totalProducts}
      />

      <SearchFilter
        search={search}
        setSearch={setSearch}
        setStatus={setStatus}
        status={status}
      />

      <ProductsDataTable
        // paginação/busca
        pagination={pagination}
        search={search}
        status={status}
        handleGetProducts={handleGetProducts}
        fetchStatusCounts={fetchStatusCounts}
        // dados
        isLoading={isLoading}
        products={products}
        // edição/novo produto
        selectedProductId={selectedProductId}
        setSelectedProductId={setSelectedProductId}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </div>
  );
}
