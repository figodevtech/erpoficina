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

interface CustomerDataTableProps{

    handleGetCustomers: (pageNumber?: number, limit?: number, search?: string, status?: Status)=>void
    pagination: Pagination,
    search: string
    status: Status
    fetchStatusCounts: ()=> void
    isLoading: boolean
    customerItems: Customer[]
}   
export default function CustomersDataTable ({handleGetCustomers, pagination, search,status, fetchStatusCounts, isLoading, customerItems}: CustomerDataTableProps) {
    return (
        <Card>
        <CardHeader>
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
            <div
              className={`w-1/2 bg-primary h-full animate-slideIn absolute left-0 rounded-lg`}
            ></div>
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
                        <Button variant={"ghost"} className="size-full flex justify-start gap-5 px-0 rounded-sm py-1.5 hover:cursor-pointer">

                          <Edit className="-ml-1 -mr-1 h-4 w-4" />
                          <span>

                          Editar
                          </span>

                        </Button>
                        {/* </DropdownMenuItem> */}
                        </CustomerDialog>
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
                Página {pagination.page} de {pagination.totalPages || 1}
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
    )
}