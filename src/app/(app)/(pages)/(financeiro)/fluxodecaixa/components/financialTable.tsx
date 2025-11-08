"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  ChevronDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Loader,
  Loader2,
  Plus,
  Trash2Icon,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import formatarEmReal from "@/utils/formatarEmReal";
import TransactionDialog from "./transactionDialog/transactionDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteAlert from "./deleteAlert";
import { toast } from "sonner";
import axios, { isAxiosError } from "axios";
import { Pagination, Tipo_transacao, Transaction } from "../types";
import { getCategoryIcon, getTypeColor } from "../utils";
import { ExportTransactionsButton } from "./ExportTransactionsButton";

interface FinancialTableProps {
  transactions: Transaction[];
  pagination: Pagination;
  handleGetTransactions: (
    pageNumber?: number,
    limit?: number,
    search?: string,
    tipo?: Tipo_transacao | ""
  ) => void;
  search: string;
  tipo: Tipo_transacao | "";
  isLoading: boolean;
  handleGetStatusCounter: () => void;
}

export default function FinancialTable({
  transactions,
  pagination,
  handleGetTransactions,
  search,
  tipo,
  isLoading,
  handleGetStatusCounter,
}: FinancialTableProps) {
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | undefined
  >(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (selectedTransactionId) setIsOpen(true);
  }, [selectedTransactionId]);

  const handleDeleteTransaction = async (id: number) => {
    setIsDeleting(true);
    toast(
      <div className="flex gap-2 items-center flex-nowrap">
        <Loader className="animate-spin w-4" />
        <span className="text-nowrap">Deletando transação...</span>
      </div>
    );
    try {
      const response = await axios.delete(`/api/transaction/${id}`, {});
      if (response.status === 204) {
        toast("Transação deletada!");
        handleGetTransactions(pagination.page, pagination.limit, search, tipo);
        handleGetStatusCounter();
      } else {
        toast.warning(`Status inesperado: ${response.status}`);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error("Error", {
          description: error.response?.data.error,
        });
      }
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
    }
  };

  // ID estável para o Select de "itens por página"
  const limitUid = React.useId();
  const limitListboxId = `${limitUid}-limit-listbox`;

  return (
    <Card className="">
      <CardHeader className="border-b-2 pb-4 flex flex-col">
        <div className="flex flex-row justify-between w-full">
          <CardTitle className="text-lg font-medium">
            Transações{" "}
            <span className="text-muted-foreground text-xs font-mono font-extralight">
              |LISTA
            </span>
          </CardTitle>
          <div className="flex flex-row gap-4 items-center">

            <ExportTransactionsButton/>

          <TransactionDialog
            open={isOpen}
            setOpen={setIsOpen}
            selectedTransactionId={selectedTransactionId}
            setSelectedTransactionId={setSelectedTransactionId}
          >
            <Button
              className="hover:cursor-pointer"
              onClick={() => setSelectedTransactionId(undefined)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </TransactionDialog>
          </div>
        </div>

        <div
          onClick={() => {
            handleGetTransactions(
              pagination.page,
              pagination.limit,
              search,
              tipo
            );
            handleGetStatusCounter();
          }}
          className="flex flex-row space-x-1 items-center hover:cursor-pointer"
        >
          <Loader2 className="w-3 h-3" />
          <span className="text-xs text-muted-foreground"> Recarregar</span>
        </div>
      </CardHeader>

      <CardContent className="min-h-[300px] -mt-[24px] px-4 pb-4 pt-0 relative">
        {/* barra superior de loading */}
        <div
          className={`${
            isLoading && "opacity-100"
          } transition-all opacity-0 h-0.5 bg-slate-400 w-full overflow-hidden absolute left-0 right-0 top-0`}
        >
          <div
            className={`w-1/2 bg-primary h-full absolute left-0 rounded-lg -translate-x-[100%] ${
              isLoading && "animate-slideIn"
            }`}
          />
        </div>

        <Table className="text-xs mt-6">
          <TableHeader>
            <TableRow className="font-bold">
              <TableCell>Descrição</TableCell>
              <TableCell className="hidden md:table-cell">Data</TableCell>
              <TableCell className="hidden md:table-cell">Tipo</TableCell>
              <TableCell className="hidden md:table-cell">Categoria</TableCell>
              <TableCell className="hidden md:table-cell">Banco</TableCell>
              <TableCell className="hidden md:table-cell">Método</TableCell>
              <TableCell className="text-right">Valor</TableCell>
              <TableCell />
            </TableRow>
          </TableHeader>

          <TableBody>
            {transactions.map((t) => {
              // IDs estáveis para o menu da linha
              const triggerId = `row-${t.id}-menu-btn`;
              const menuId = `row-${t.id}-menu`;

              return (
                <TableRow
                  key={t.id}
                  onDoubleClick={() => setSelectedTransactionId(t.id)}
                  className="hover:cursor-pointer"
                >
                  <TableCell className="flex flex-row items-center gap-2">
                    <div className="rounded-full p-2 bg-primary/50">
                      {getCategoryIcon(t.categoria)}
                    </div>
                    <div className="flex flex-col items-start">
                      {t.descricao}
                      <span className="text-xs text-muted-foreground">
                        ID: {t.id}
                      </span>
                      <span className="text-xs text-muted-foreground md:hidden">
                        {t.banco.titulo} - {t.metodopagamento}
                      </span>
                      <span className="text-muted-foreground text-nowrap flex-nowrap flex justify-center items-center gap-2 md:hidden">
                        <Calendar className="w-[10px] h-[10px]" />
                        {formatDate(t.data)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    {formatDate(t.data)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{t.tipo}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {t.categoria}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {t.banco.titulo}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {t.metodopagamento}
                  </TableCell>

                  <TableCell className={`text-right ${getTypeColor(t.tipo)}`}>
                    <div className="flex flex-col items-end">
                      {(t.tipo === "RECEITA" || t.tipo === "DEPOSITO") && "+ "}
                      {(t.tipo === "DESPESA" || t.tipo === "SAQUE") && "- "}
                      {formatarEmReal(t.valorLiquido)}
                      {t.valorLiquido !== t.valor && (
                        <span className="text-xs text-muted-foreground">
                          Bruto: {formatarEmReal(t.valor)}
                        </span>
                      )}

                    </div>
                  </TableCell>

                  <TableCell className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          id={triggerId}
                          aria-controls={menuId}
                          variant="ghost"
                          className="h-8 w-8 p-0 cursor-pointer"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        id={menuId}
                        aria-labelledby={triggerId}
                        className="space-y-1"
                      >
                        
                        <DeleteAlert
                          handleDeleteTransaction={handleDeleteTransaction}
                          isAlertOpen={isAlertOpen}
                          setIsAlertOpen={setIsAlertOpen}
                          idToDelete={t.id}
                        >
                          <Button
                            variant="default"
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
              );
            })}
          </TableBody>
        </Table>

        <div className="flex items-center mt-4 justify-between">
          <div className="text-xs text-muted-foreground mr-2 flex flex-nowrap">
            <span>{pagination.limit * (pagination.page - 1) + 1}</span>
            {" - "}
            <span>
              {pagination.limit * (pagination.page - 1) + transactions.length}
            </span>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="hover:cursor-pointer"
              onClick={() =>
                handleGetTransactions(1, pagination.limit, search, tipo)
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
                handleGetTransactions(
                  pagination.page - 1,
                  pagination.limit,
                  search,
                  tipo
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
                handleGetTransactions(
                  pagination.page + 1,
                  pagination.limit,
                  search,
                  tipo
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
                handleGetTransactions(
                  pagination.totalPages,
                  pagination.limit,
                  search,
                  tipo
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

          {/* Select de itens por página com IDs estáveis */}
          <div>
            <Select /* você pode controlar com value/onValueChange depois */>
              <SelectTrigger
                className="hover:cursor-pointer ml-2"
                aria-controls={limitListboxId}
              >
                <SelectValue placeholder={pagination.limit} />
              </SelectTrigger>
              <SelectContent id={limitListboxId}>
                <SelectItem className="hover:cursor-pointer" value="20">
                  {pagination.limit}
                </SelectItem>
                {/* adicione mais opções se quiser */}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
