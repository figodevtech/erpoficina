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
    BanknoteArrowUp,
    ChevronDown,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeft,
    ChevronsRight,
    Loader2,
    Plus,
    Search,
  } from "lucide-react";
  import SearchFilter from "./searchFilter";
import { Pagination, Tipo_transacao, transacao } from "../types";
import { formatDate } from "@/utils/formatDate";
import formatarEmReal from "@/utils/formatarEmReal";
import { getCategoryIcon, getTypeColor } from "../utils";

  interface FinancialTableProps{
    transactions: transacao[]
    pagination: Pagination
    handleGetTransactions: (pageNumber?: number, limit?: number, search?: string, tipo?: Tipo_transacao | "")=> void
    search: string
    tipo: Tipo_transacao | ""
    isLoading: boolean
    handleGetStatusCounter: ()=> void
  }
  export default function FinancialTable({transactions, pagination, handleGetTransactions, search, tipo, isLoading, handleGetStatusCounter}: FinancialTableProps) {
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </div>
          <div 
          onClick={()=>{handleGetTransactions(pagination.page, pagination.limit, search, tipo);handleGetStatusCounter()}}
          className="flex flex-row space-x-1 items-center hover:cursor-pointer">
            <Loader2 className="w-3 h-3" />
            <span className="text-xs text-muted-foreground"> Recarregar</span>
          </div>
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
          <Table className=" text-xs mt-6">
            <TableHeader>
              <TableRow className="font-bold">
                <TableCell>Descrição</TableCell>
                <TableCell >Data</TableCell>
                <TableCell >Tipo</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Banco</TableCell>
                <TableCell>Método</TableCell>
                <TableCell className="text-right">Valor</TableCell>
                <TableCell ></TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t)=> (
                <TableRow key={t.id} className="hover:cursor-pointer">
                  <TableCell className="flex flex-row items-center gap-2">
                    <div className=" rounded-full p-2 bg-primary/50">
                    {getCategoryIcon(t.categoria)}
                    {/* <BanknoteArrowUp className="text-black-500 size-4"/> */}
                    </div>
                    {t.descricao}</TableCell>
                  <TableCell>{formatDate(t.data)}</TableCell>
                  <TableCell>{t.tipo}</TableCell>
                  <TableCell>{t.categoria}</TableCell>
                  <TableCell>{t.banco.titulo}</TableCell>
                  <TableCell>{t.metodopagamento}</TableCell>
                  <TableCell className={`text-right ${getTypeColor(t.tipo)}`}>{formatarEmReal(t.valor)}</TableCell>
                  <TableCell className=" flex justify-end "><ChevronDown/></TableCell>
                </TableRow>
              )) }
              
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
                    handleGetTransactions(pagination.page - 1, pagination.limit, search)
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
    );
  }
