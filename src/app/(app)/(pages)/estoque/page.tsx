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
import { useEffect, useMemo, useState } from "react";
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
import { ProductDialog } from "./productDialog/productDialog";

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            Controle de Estoque
          </h1>
          <p className="text-muted-foreground text-pretty">
            Gestão completa do inventário de peças e produtos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* <Button className="hover:cursor-pointer ">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button> */}
          <ProductDialog/>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Itens
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStatusCounter ? (
              <Skeleton className="h-8 w-8"></Skeleton>
            ) : (
              <div className="text-2xl font-bold">{totalProducts}</div>
            )}
            <p className="text-xs text-muted-foreground">Produtos listados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Itens Críticos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {loadingStatusCounter ? (
              <Skeleton className="w-8 h-8"></Skeleton>
            ) : (
              <div className="text-2xl font-bold text-destructive">
                {statusCounts.CRITICO}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Reposição urgente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {loadingStatusCounter ? (
              <Skeleton className="w-8 h-8"></Skeleton>
            ) : (
              <div className="text-2xl font-bold text-orange-500">
                {statusCounts.BAIXO}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Atenção necessária</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Bom</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStatusCounter ? (
              <Skeleton className="w-8 h-8"></Skeleton>
            ) : (
              <div className="text-2xl font-bold">{statusCounts.OK}</div>
            )}
            <p className="text-xs text-muted-foreground">Valor do inventário</p>
          </CardContent>
        </Card>
      </div>

      {/* Search / Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Busque por código, descrição, referência, título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as Estoque_status)}
            >
              <SelectTrigger className="w-full md:w-2/6 hover:cursor-pointer">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  className="hover:cursor-pointer"
                  value={Estoque_status.TODOS}
                >
                  Todos
                </SelectItem>
                <SelectItem
                  className="hover:cursor-pointer"
                  value={Estoque_status.OK}
                >
                  Ok
                </SelectItem>
                <SelectItem
                  className="hover:cursor-pointer"
                  value={Estoque_status.BAIXO}
                >
                  Estoque Baixo
                </SelectItem>
                <SelectItem
                  className="hover:cursor-pointer"
                  value={Estoque_status.CRITICO}
                >
                  Crítico
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Produtos */}
      <Card>
      <CardHeader className="border-b-2 pb-4 ">
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            <div
              onClick={() => {
                handleGetProducts(pagination.page, pagination.limit, search, status);
                fetchStatusCounts();
              }}
              className="flex flex-nowrap gap-1 hover:cursor-pointer w-fit text-foreground/50 hover:text-foreground/70"
            >
              <span>recarregar</span>
              <Loader2 width={12} />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] -mt-[24px] px-4 pb-4 pt-0 relative">
        <div
          className={`${
            isLoading && " opacity-100"
          } transition-all opacity-0 h-0.5 bg-slate-400 w-full overflow-hidden absolute left-0 right-0 top-0`}
        >
          <div
            className={`w-1/2 bg-primary h-full  absolute left-0 rounded-lg  -translate-x-[100%] ${isLoading && "animate-slideIn "} `}
          ></div>
        </div>
        <Table className="mt-6">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Fabricante</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Mín.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Preço Unit.</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const valorTotal = (p.estoque ?? 0) * p.precovenda;

                return (
                  <TableRow key={p.id} className="hover:cursor-pointer">
                    <TableCell>{p.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium">{p.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.unidade}
                            {p.fabricante ? ` • ${p.fabricante}` : ""}
                          </p>
                          {p.codigobarras && (
                            <p className="text-xs text-muted-foreground">
                              CODIGOBARRAS: {p.codigobarras}
                            </p>
                          )}
                          
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs">
                      {p.referencia}
                    </TableCell>
                    <TableCell>{p.fabricante}</TableCell>

                    <TableCell className="font-medium">
                      {p.estoque ?? 0}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.estoqueminimo ?? 0}
                    </TableCell>

                    <TableCell>{getStatusBadge(p.status_estoque)}</TableCell>

                    <TableCell>
                      R{"$ "}
                      {p.precovenda.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>

                    <TableCell>
                      R{"$ "}
                      {valorTotal.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 cursor-pointer"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="space-y-1">
                          <DropdownMenuItem className="hover:cursor-pointer">
                            <Pen className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:cursor-pointer">
                            <Plus className="h-4 w-4 mr-2" />
                            Registrar entrada
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:cursor-pointer bg-red-500/20 data-[highlighted]:bg-red-500 group data-[highlighted]:text-white transition-all">
                            <Trash2Icon className="h-4 w-4 mr-2 group-hover:text-white" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex items-center mt-4 justify-between">
            <div className="text-xs text-muted-foreground mr-2 flex flex-nowrap">
              <span>{pagination.limit * (pagination.page - 1) + 1}</span> -{" "}
              <span>
                {pagination.limit * (pagination.page - 1) +
                  (pagination.pageCount || 0)}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="hover:cursor-pointer"
                onClick={() => handleGetProducts(1, pagination.limit, search, status)}
                disabled={pagination.page === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:cursor-pointer"
                onClick={() =>
                  handleGetProducts(
                    pagination.page - 1,
                    pagination.limit,
                    search
                  )
                }
                disabled={pagination.page === 1}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium text-nowrap">
                Página {pagination.page} de {pagination.totalPages || 1}
              </span>
              <Button
                className="hover:cursor-pointer"
                variant="outline"
                size="icon"
                onClick={() =>
                  handleGetProducts(
                    pagination.page + 1,
                    pagination.limit,
                    search,
                    status
                  )
                }
                disabled={
                  pagination.page === pagination.totalPages ||
                  pagination.totalPages === 0
                }
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                className="hover:cursor-pointer"
                variant="outline"
                size="icon"
                onClick={() =>
                  handleGetProducts(
                    pagination.totalPages,
                    pagination.limit,
                    search,
                    status
                  )
                }
                disabled={
                  pagination.page === pagination.totalPages ||
                  pagination.totalPages === 0
                }
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <Select>
                <SelectTrigger className="hover:cursor-pointer ml-2">
                  <SelectValue placeholder={pagination.limit}></SelectValue>
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem className="hover:cursor-pointer" value="20">
                    {pagination.limit}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
