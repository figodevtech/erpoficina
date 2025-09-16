"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  Plus,
  UserCheck,
  UserX,
  MoreHorizontal,
  Edit,
  Send,
  Trash2Icon,
  Loader2,
  ChevronsLeft,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Customer, ClientStatus, Pagination, Status } from "./types";
import { getStatusBadge } from "./utils";
import FormatarTelefone from "@/utils/formatarTelefone";
import Link from "next/link";
import useStatusCounter from "./hooks/status-counter";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export default function ClientesPage() {
  const [customerItems, setCustomerItems] = useState<Customer[]>([]);
  const {
    statusCounts,
    loadingStatusCounter,
    totalCustomers,
    error,
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

  useEffect(() => {
    console.log("Status Counts updated:", loadingStatusCounter);
  }, [loadingStatusCounter]);

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            Gestão de Clientes
          </h1>
          <p className="text-muted-foreground text-pretty">
            Controle completo da base de clientes da oficina
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* KPI Cards (ajustados para a interface) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStatusCounter ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <div className="text-2xl font-bold">{totalCustomers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Ativos
            </CardTitle>
            <UserCheck className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            {loadingStatusCounter ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <div className="text-2xl font-bold text-chart-4">
                {statusCounts.ATIVO || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Status {ClientStatus.ATIVO}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Inativos
            </CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStatusCounter ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <div className="text-2xl font-bold text-muted-foreground">
                {statusCounts.INATIVO || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Status {ClientStatus.INATIVO || 0} • Pendentes:{" "}
              {statusCounts.PENDENTE || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Clientes</CardTitle>
          <CardDescription>
            Encontre rapidamente os clientes da sua oficina
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Buscar por nome, email ou telefone..."
                className="pl-10"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as Status)}
            >
              <SelectTrigger className="w-full md:w-2/6 hover:cursor-pointer">
                <SelectValue placeholder="Todos"></SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value={Status.TODOS}
                  className="hover:cursor-pointer"
                >
                  Todos
                </SelectItem>
                <SelectItem
                  value={Status.ATIVO}
                  className="hover:cursor-pointer"
                >
                  Ativos
                </SelectItem>
                <SelectItem
                  value={Status.INATIVO}
                  className="hover:cursor-pointer"
                >
                  Inativos
                </SelectItem>
                <SelectItem
                  value={Status.PENDENTE}
                  className="hover:cursor-pointer"
                >
                  Pendentes
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table (colunas compatíveis com a interface) */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes </CardTitle>
          <CardDescription>
            <div
              onClick={() => {
                handleGetCustomers(pagination.page, pagination.limit, search, status);
                fetchStatusCounts();
              }}
              className="flex flex-nowrap gap-1 hover:cursor-pointer w-fit text-foreground/50 hover:text-foreground/70"
            >
              <span>recarregar</span>
              <Loader2 width={12} />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          <div
            className={`${
              isLoading && " opacity-100"
            } transition-all opacity-0 h-1 bg-slate-400 w-full overflow-hidden relative rounded-full`}
          >
            <div className={`w-1/2 bg-primary h-full animate-slideIn absolute left-0 rounded-lg`}></div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Cidade/UF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerItems.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {customer.nomerazaosocial}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer.tipopessoa === "FISICA" ? "PF" : "PJ"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{customer.email}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        {FormatarTelefone(customer.telefone)}
                        {customer.telefone && (
                          <Link
                            target="_blank"
                            className="ml-2 group flex flex-row w-max gap-2 px-2 py-0.5 rounded-md items-center justify-center bg-primary text-accent text-center text-[10px] dark:text-white"
                            href={"http://wa.me/55" + customer.telefone}
                          >
                            Whatsapp
                            <Send className="" size={10} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {customer.cpfcnpj}
                  </TableCell>
                  <TableCell className="text-sm">
                    {customer.cidade}/{customer.estado}
                  </TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="space-y-1" align="end">
                        <DropdownMenuItem className="hover:cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:cursor-pointer bg-red-500/20 data-[highlighted]:bg-red-500 group data-[highlighted]:text-white transition-all">
                          <Trash2Icon className="h-4 w-4 mr-2 group-hover:text-white" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center mt-4 justify-between">
            <div className="text-xs text-muted-foreground mr-2 flex flex-nowrap">
              <span>{pagination.limit*(pagination.page-1)+1}</span> - <span>{pagination.limit*(pagination.page-1)+(pagination.pageCount || 0)}</span>

            </div>
            <div className="flex items-center justify-center space-x-2">

            <Button
              variant="outline"
              size="icon"
              className="hover:cursor-pointer"
              onClick={() => handleGetCustomers(1, pagination.limit, search, status)}
              disabled={pagination.page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hover:cursor-pointer"
              onClick={() => handleGetCustomers(pagination.page - 1, pagination.limit, search, status)}
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
              onClick={() => handleGetCustomers(pagination.page + 1, pagination.limit, search, status)}
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
              onClick={() => handleGetCustomers(pagination.totalPages, pagination.limit, search, status)}
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
                  <SelectItem className="hover:cursor-pointer" value="20">{pagination.limit}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
