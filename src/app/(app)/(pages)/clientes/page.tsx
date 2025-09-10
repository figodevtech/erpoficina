"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Eye,
  Edit,
  Trash2,
  Send,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Customer, ClientStatus } from "./types";
import { getStatusBadge } from "./utils";
import FormatarTelefone from "@/utils/formatarTelefone";
import Link from "next/link";
import useStatusCounter from "./hooks/status-counter";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientesPage() {
  const [customerItems, setCustomerItems] = useState<Customer[]>([]);
  const {
    statusCounts,
    loadingStatusCounter,
    totalCustomers,
    error,
    fetchStatusCounts,
  } = useStatusCounter();

  const getCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.status === 200) {
        const json = await response.json();
        setCustomerItems(json.data);
        // console.log("Clientes carregados:", json.data);
      }
    } catch (error) {
      console.log("Erro ao buscar clientes:", error);
    } finally {
    }
  };

  useEffect(() => {
    getCustomers();
  }, []);

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
                placeholder="Buscar por nome, email ou telefone..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Todos</Button>
              <Button variant="outline">Ativos</Button>
              <Button variant="outline">Inativos</Button>
              <Button variant="outline">Pendentes</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table (colunas compatíveis com a interface) */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Visualização detalhada da base de clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
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
        </CardContent>
      </Card>
    </div>
  );
}
