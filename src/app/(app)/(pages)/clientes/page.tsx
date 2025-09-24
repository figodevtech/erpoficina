"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Customer, Pagination, Status } from "./types";
import useStatusCounter from "./hooks/status-counter";

import Header from "./components/header";
import Cards from "./components/cards";
import SearchFilter from "./components/searchfilter";
import CustomersDataTable from "./components/customers-data-table";

export default function ClientesPage() {
  const [customerItems, setCustomerItems] = useState<Customer[]>([]);
  const {
    statusCounts,
    loadingStatusCounter,
    totalCustomers,
    fetchStatusCounts,
  } = useStatusCounter();
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [status, setStatus] = useState<Status>(Status.TODOS);
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState <number | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const handleGetCustomers = async (
    pageNumber?: number,
    limit?: number,
    search?: string,
    status?: Status
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/customers", {
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
        setCustomerItems(data.data);
        setPagination(data.pagination);
        console.log("Clientes carregados:", data.data);
      }
    } catch (error) {
      console.log("Erro ao buscar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetCustomers();
  }, []);

  useEffect(() => {
    handleGetCustomers(1, pagination.limit, search, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  return (
    <div className="space-y-6">
      <Header
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      selectedCustomerId={selectedCustomerId}
      setSelectedCustomerId={setSelectedCustomerId}
      />

      <Cards 
      statusCounts={statusCounts}
      loadingStatusCounter={loadingStatusCounter}
      totalCustomers={totalCustomers}
      />

      <SearchFilter
      search={search}
      setSearch={setSearch}
      setStatus={setStatus}
      status={status}
      />

      {/* Customers Table (colunas compatíveis com a interface) */}
      
      <CustomersDataTable
      isAlertOpen={isAlertOpen}
      setIsAlertOpen={setIsAlertOpen}
      setSeletedCustomerId={setSelectedCustomerId}
      customerItems={customerItems}
      fetchStatusCounts={fetchStatusCounts}
      handleGetCustomers={handleGetCustomers}
      isLoading={isLoading}
      pagination={pagination}
      search={search}
      status={status}
      />

    </div>
  );
}
