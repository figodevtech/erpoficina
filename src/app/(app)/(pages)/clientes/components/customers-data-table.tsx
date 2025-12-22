"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Send,
  Trash2Icon,
  Loader2,
  ChevronsLeft,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRight,
  Loader,
} from "lucide-react";

import { Select, SelectValue, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Customer, Pagination, Status } from "../types";
import formatarTelefone from "@/utils/formatarTelefone";
import Link from "next/link";
import { getStatusBadge } from "../utils";
import { CustomerDialog } from "./customerDialogRegister/customerDialog";
import DeleteAlert from "./deleteAlert";
import { useState } from "react";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { ExportCustomersButton } from "./ExportCustomersButton";

interface CustomerDataTableProps {
  handleGetCustomers: (pageNumber?: number, limit?: number, search?: string, status?: Status) => void;
  pagination: Pagination;
  search: string;
  status: Status;
  fetchStatusCounts: () => void;
  isLoading: boolean;
  customerItems: Customer[];
  selectedCustomerId?: number | undefined;
  setSelectedCustomerId: (value: number | undefined) => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  isAlertOpen: boolean;
  setIsAlertOpen: (value: boolean) => void;
}

export default function CustomersDataTable({
  handleGetCustomers,
  pagination,
  search,
  status,
  fetchStatusCounts,
  isLoading,
  customerItems,
  selectedCustomerId,
  setSelectedCustomerId,
  isOpen,
  setIsOpen,
  isAlertOpen,
  setIsAlertOpen,
}: CustomerDataTableProps) {
  const [, setIsDeleting] = useState(false);

  const handleDeleteUser = async (id: number) => {
    setIsDeleting(true);
    try {
      const response = await axios.delete(`/api/customers/${id}`);
      if (response.status === 204) {
        toast("Usuário deletado!");
        handleGetCustomers(pagination.page, pagination.limit, search, status);
        fetchStatusCounts();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error("Error", {
          description: error.response?.data.error,
        });
      }
    } finally {
      setIsAlertOpen(false);
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      {/* 🔁 Cabeçalho da tabela com botão Novo Cliente no canto superior direito */}
      <CardHeader className="border-b-2 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription className="flex flex-col">
              <button
                onClick={() => {
                  handleGetCustomers(pagination.page, pagination.limit, search, status);
                  fetchStatusCounts();
                }}
                className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground/70 hover:cursor-pointer"
              >
                <span>Recarregar</span>
                <Loader2 width={12} className={isLoading ? "animate-spin" : ""} />
              </button>
            </CardDescription>
          </div>

          {/* 👉 Botão movido para cá */}
          <div className="flex items-center gap-2">
            <ExportCustomersButton search={search} status={status} />

            <CustomerDialog
              customerId={selectedCustomerId}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              setSelectedCustomerId={setSelectedCustomerId}
            >
              <Button className="hover:cursor-pointer">Novo Cliente</Button>
            </CustomerDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-h-[300px] -mt-[24px] px-4 pb-4 pt-0 relative">
        <div
          className={`${
            isLoading && " opacity-100"
          } transition-all opacity-0 h-0.5 bg-slate-400 w-full overflow-hidden absolute left-0 right-0 top-0`}
        >
          <div
            className={`w-1/2 bg-primary h-full  absolute left-0 rounded-lg  -translate-x-[100%] ${
              isLoading && "animate-slideIn "
            } `}
          ></div>
        </div>

        <Table className="mt-6 text-xs">
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
              <TableRow
                key={customer.id}
                onDoubleClick={() => setSelectedCustomerId(customer.id)}
                className="hover:cursor-pointer"
              >
                <TableCell>{customer.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{customer.nomerazaosocial}</div>
                    <div className="text-sm text-muted-foreground">
                      {customer.tipopessoa === "FISICA" ? "PF" : "PJ"}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">{customer.email}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      {formatarTelefone(customer.telefone)}
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
                <TableCell className="font-mono text-sm">{customer.cpfcnpj}</TableCell>
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
                    <DropdownMenuContent className="space-y-1" align="center">
                      <CustomerDialog customerId={customer.id}>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                      </CustomerDialog>

                      <DeleteAlert
                        idToDelete={customer.id}
                        isAlertOpen={isAlertOpen}
                        setIsAlertOpen={setIsAlertOpen}
                        handleDeleteUser={handleDeleteUser}
                      >
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} variant="destructive">
                          <Trash2Icon className=" h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DeleteAlert>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center mt-4 justify-between">
          <div className="text-xs text-muted-foreground flex flex-nowrap">
            <span>{pagination.limit * (pagination.page - 1) + 1}</span> -{" "}
            <span>{pagination.limit * (pagination.page - 1) + (pagination.pageCount || 0)}</span>
            <span className="ml-1 hidden sm:block">de {pagination.total}</span>
            <Loader className={`w-4 h-full animate-spin transition-all opacity-0 ${isLoading && "opacity-100"}`} />
          </div>

          <div className="flex items-center justify-center space-x-1 sm:space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="hover:cursor-pointer"
              onClick={() => handleGetCustomers(1, pagination.limit, search, status)}
              disabled={pagination.page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover:cursor-pointer"
              onClick={() => handleGetCustomers(pagination.page - 1, pagination.limit, search, status)}
              disabled={pagination.page === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-[10px] sm:text-xs font-medium text-nowrap">
              Pg. {pagination.page} de {pagination.totalPages || 1}
            </span>

            <Button
              className="hover:cursor-pointer"
              variant="outline"
              size="sm"
              onClick={() => handleGetCustomers(pagination.page + 1, pagination.limit, search, status)}
              disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              className="hover:cursor-pointer"
              variant="outline"
              size="sm"
              onClick={() => handleGetCustomers(pagination.totalPages, pagination.limit, search, status)}
              disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Select>
              <SelectTrigger size="sm" className="hover:cursor-pointer ml-2">
                <SelectValue placeholder={pagination.limit}></SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="hover:cursor-pointer" value="20">
                  {pagination.limit}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
