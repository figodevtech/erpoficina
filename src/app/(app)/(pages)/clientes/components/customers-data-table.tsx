"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Customer, Pagination, Status } from "../types";
import formatarTelefone from "@/utils/formatarTelefone";
import Link from "next/link";
import { getStatusBadge } from "../utils";
import { CustomerDialog } from "./customerDialogRegister/customerDialog";
import DeleteAlert from "./deleteAlert";
import { useState } from "react";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";

interface CustomerDataTableProps {
  handleGetCustomers: (
    pageNumber?: number,
    limit?: number,
    search?: string,
    status?: Status
  ) => void;
  pagination: Pagination;
  search: string;
  status: Status;
  fetchStatusCounts: () => void;
  isLoading: boolean;
  customerItems: Customer[];
  setSeletedCustomerId: (value: number) => void;
  isAlertOpen: boolean;
  setIsAlertOpen: (value: boolean)=>void
}
export default function CustomersDataTable({
  handleGetCustomers,
  pagination,
  search,
  status,
  fetchStatusCounts,
  isLoading,
  customerItems,
  setSeletedCustomerId,
  isAlertOpen,
  setIsAlertOpen
}: CustomerDataTableProps) {

  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteUser = async (id: number) => {
    setIsDeleting(true)
    try {
      const response = await axios.delete(`/api/customers/${id}`, {
      })

      if(response.status === 204){
        console.log(response)
        toast("Usuário deletado!")
        handleGetCustomers(
                pagination.page,
                pagination.limit,
                search,
                status
              );
              fetchStatusCounts();
      }
    } catch (error) {
      if(isAxiosError(error)){
        console.log(error)
        toast.error("Error", {
          description: error.response?.data.error
        })
      }
    }finally{
      setIsAlertOpen(false)
      setIsDeleting(false)
    }
  }
  return (
    <Card>
      <CardHeader className="border-b-2 pb-4 ">
        <CardTitle>Lista de Clientes </CardTitle>
        <CardDescription>
          <div
            onClick={() => {
              handleGetCustomers(
                pagination.page,
                pagination.limit,
                search,
                status
              );
              fetchStatusCounts();
            }}
            className="flex flex-nowrap gap-1 hover:cursor-pointer w-fit text-foreground/50 hover:text-foreground/70]"
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
              <TableHead>Cliente</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody >
            {customerItems.map((customer) => (
              <TableRow
                key={customer.id}
                onDoubleClick={() => setSeletedCustomerId(customer.id)}
                className="hover:cursor-pointer"
              >
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
                      <CustomerDialog customerId={customer.id}>
                        {/* <DropdownMenuItem className="hover:cursor-pointer"> */}
                        <Button
                          variant={"ghost"}
                          className="size-full flex justify-start gap-5 px-0 rounded-sm py-2 hover:cursor-pointer"
                        >
                          <Edit className="-ml-1 -mr-1 h-4 w-4" />
                          <span>Editar</span>
                        </Button>
                      </CustomerDialog>

                      <DeleteAlert
                      idToDelete={customer.id}
                      isAlertOpen={isAlertOpen}
                      setIsAlertOpen={setIsAlertOpen}
                      handleDeleteUser={handleDeleteUser}
                      >
                        <Button
                          variant={"default"}
                          className="size-full flex justify-start gap-5 px-0 rounded-sm py-2 hover:cursor-pointer bg-red-500/20 hover:bg-red-500 group hover:text-white transition-all"
                        >
                          <Trash2Icon className="-ml-1 -mr-1 h-4 w-4" />
                          <span>Excluir</span>
                        </Button>
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
            <span>
              {pagination.limit * (pagination.page - 1) +
                (pagination.pageCount || 0)}
            </span>
            <span className="ml-1 hidden sm:block">de {pagination.total}</span>
            <Loader
              className={`ml-2 w-4 h-full animate-spin transition-all opacity-0 ${
                isLoading && "opacity-100"
              }`}
            />
          </div>

          <div className="flex items-center justify-center space-x-1 sm:space-x-3">
            <Button
              variant="outline"
              size="icon"
              className="hover:cursor-pointer"
              onClick={() =>
                handleGetCustomers(1, pagination.limit, search, status)
              }
              disabled={pagination.page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hover:cursor-pointer"
              onClick={() =>
                handleGetCustomers(
                  pagination.page - 1,
                  pagination.limit,
                  search,
                  status
                )
              }
              disabled={pagination.page === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-nowrap">
              Pg. {pagination.page} de {pagination.totalPages || 1}
            </span>

            <Button
              className="hover:cursor-pointer"
              variant="outline"
              size="icon"
              onClick={() =>
                handleGetCustomers(
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
                handleGetCustomers(
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
          <div className="">
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
  );
}
