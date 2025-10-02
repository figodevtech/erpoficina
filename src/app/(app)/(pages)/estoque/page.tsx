"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  Clock,
  TrendingDown,
  TrendingUp,
  ChevronDown,
  Pen,
  Trash2Icon,
  ChevronsRight,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronsLeft,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Produto, Pagination, Estoque_status } from "./types";
import axios from "axios";
import useStatusCounter from "./hooks/status-counter";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "./components/header";
import Cards from "./components/cards";
import SearchFilter from "./components/searchFilter";
import ProductsDataTable from "./components/products-data-table";

// 🔎 Deriva status a partir de estoque x estoque mínimo
const getStatusBadge = (status: Estoque_status) => {
  if (status === "CRITICO") {
    return (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Crítico
      </Badge>
    );
  }

  if (status === "BAIXO") {
    return (
      <Badge variant="secondary" className="text-xs bg-yellow-600 not-dark:text-white">
        <Clock className="h-3 w-3 mr-1" />
        Baixo
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs">
      OK
    </Badge>
  );
};

export default function EstoquePage() {
  const [status, setStatus] = useState<Estoque_status>(Estoque_status.TODOS);
  const [products, setProducts] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const {
    statusCounts,
    loadingStatusCounter,
    totalProducts,
    error,
    fetchStatusCounts,
  } = useStatusCounter();

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

  useEffect(()=>{
    handleGetProducts(1, pagination.limit, search, status)
  },[search, status])

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}

      <Header/>

      {/* KPI Cards */}
      
      <Cards
      loadingStatusCounter={loadingStatusCounter}
      statusCounts={statusCounts}
      totalProducts={totalProducts}
      />

      {/* Search / Filtros */}
      
      <SearchFilter search={search} setSearch={setSearch} setStatus={setStatus} status={status}/>
      {/* Tabela de Produtos */}
      <ProductsDataTable
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
