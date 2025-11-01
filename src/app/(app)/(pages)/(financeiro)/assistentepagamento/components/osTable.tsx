"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ordem, StatusOS } from "../../../ordens/types";
import { Pagination } from "../../fluxodecaixa/types";
import {
  ChevronDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OsFinancialDialog from "./osFinancialDialog/osFinancialDialog";
import formatarEmReal from "@/utils/formatarEmReal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

interface OsTableProps {
  ordens: Ordem[];
  pagination: Pagination;
  handleGetOrdens: (
    status: StatusOS,
    pageNumber?: number,
    limit?: number,
    search?: string
  ) => void;
  isLoading: boolean;
  search: string;
}

export default function OsTable({
  ordens,
  pagination,
  handleGetOrdens,
  isLoading,
  search,
}: OsTableProps) {
  // ID estável para o Select de "itens por página"
  const [selectedStatus, setSelectedStatus] = useState<StatusOS>("PAGAMENTO");
  const limitUid = React.useId();
  const limitListboxId = `${limitUid}-os-limit-listbox`;
  const tabTheme =
    " dark:data-[state=active]:bg-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

  useEffect(()=> {
    handleGetOrdens(selectedStatus);
  },[selectedStatus])

  return (
    <Card className="">
      <CardHeader className="border-b-2 flex flex-col">
        <div className="flex flex-row justify-between w-full">
          <CardTitle className="text-lg font-medium">
            Ordens de Serviço{" "}
            <span className="text-muted-foreground text-xs font-mono font-extralight">
              |EM PAGAMENTO
            </span>
          </CardTitle>
        </div>

        <div
          onClick={() => handleGetOrdens(selectedStatus, pagination.page)}
          className="flex flex-row space-x-1 items-center hover:cursor-pointer"
        >
          <Loader2 className="w-3 h-3" />
          <span className="text-xs text-muted-foreground"> Recarregar</span>
        </div>
        <Tabs defaultValue="abertas" className="w-full items-center">
          <TabsList  className="rounded-b-none">
            <TabsTrigger onClick={()=>
              setSelectedStatus("PAGAMENTO")
            }  className={" rounded-b-none cursor-pointer" + tabTheme} value="abertas">Abertas</TabsTrigger>
            <TabsTrigger onClick={()=>
              setSelectedStatus("CONCLUIDO")
            }  className={" rounded-b-none cursor-pointer" + tabTheme} value="concluidas">Concluídas</TabsTrigger>
            </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="min-h-[300px] -mt-[24px] px-4 pb-4 pt-0 relative flex flex-col justify-between">
        {/* barra superior de loading */}
        <div
          className={`${
            isLoading && "opacity-100"
          } transition-all opacity-0 h-0.5 bg-slate-400 w-full overflow-hidden absolute left-0 right-0 top-0`}
        >
          <div
            className={`w-1/2 bg-primary h-full absolute left-0 rounded-lg -translate-x-[100%] ${
              isLoading && "animate-slideIn "
            }`}
          />
        </div>

        <Table className="text-xs mt-6">
          <TableHeader>
            <TableRow className="font-bold">
              <TableCell>ID</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Setor</TableCell>
              <TableCell>Pago</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Situação</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {ordens.map((o) => {
              // IDs estáveis por linha para o menu
              const triggerId = `os-row-${o.id}-menu-btn`;
              const menuId = `os-row-${o.id}-menu`;

              return (
                <TableRow key={o.id} className="hover:cursor-pointer">
                  {/* ... suas outras células (descrição, data etc.) aqui, se/quando tiver ... */}
                  <TableCell>{o.id}</TableCell>
                  <TableCell>{o.descricao}</TableCell>
                  <TableCell>{o.cliente?.nome}</TableCell>
                  <TableCell>{o.setor?.nome}</TableCell>
                  <TableCell className=" text-blue-300 not-dark:text-blue-700 font-bold">
                    {formatarEmReal(
                      o.transacoes?.reduce(
                        (acc, t) => acc + Number(t?.valor ?? 0),
                        0
                      ) ?? 0
                    )}
                  </TableCell>
                  <TableCell>{formatarEmReal(o.orcamentototal || 0)}</TableCell>
                  <TableCell className="">
                    {
                      o.orcamentototal ? 
                      ((o.transacoes?.reduce((acc, t) => acc + Number(t?.valor ?? 0),0) || 0) < (o.orcamentototal || 0) ? <span className="font-bold text-amber-400">Pendente</span > : 
                      
                      <span className="font-bold text-green-400">Faturado</span>
                    
                    )
                    : "Orçamento falta valor"
                    }
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
                        <OsFinancialDialog osId={o.id}>
                          <Button disabled={o.orcamentototal <=0 } className="size-full flex justify-start gap-5 px-0 rounded-sm py-2 not-dark:text- hover:cursor-pointer bg-green-500/20 hover:bg-green-500 group hover:text-white transition-all">
                            <DollarSign className="-ml-1 -mr-1 h-4 w-4" />
                            <span>Pagamento</span>
                          </Button>
                        </OsFinancialDialog>
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
              {pagination.limit * (pagination.page - 1) + ordens.length}
            </span>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="hover:cursor-pointer"
              onClick={() => handleGetOrdens(selectedStatus, 1, pagination.limit, search)}
              disabled={pagination.page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="hover:cursor-pointer"
              onClick={() =>
                handleGetOrdens(selectedStatus, pagination.page - 1, pagination.limit, search)
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
                handleGetOrdens(selectedStatus, pagination.page + 1, pagination.limit, search)
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
                handleGetOrdens(selectedStatus, pagination.totalPages, pagination.limit, search)
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
            <Select>
              <SelectTrigger
                className="hover:cursor-pointer ml-2"
                aria-controls={limitListboxId}
              >
                <SelectValue placeholder={`${pagination.limit}`} />
              </SelectTrigger>
              <SelectContent id={limitListboxId}>
                <SelectItem className="hover:cursor-pointer" value="20">
                  {pagination.limit}
                </SelectItem>
                {/* adicione mais opções se desejar (10/20/50/100...) */}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
