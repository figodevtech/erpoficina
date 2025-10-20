"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ordem } from "../../../ordens/types"
import { Pagination } from "../../types"
import { ChevronDown, ChevronLeftIcon, ChevronRightIcon, ChevronsLeft, ChevronsRight, DollarSign, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OsTableProps {
    ordens: Ordem[]
    pagination: Pagination
    handleGetOrdens: ()=> void
    isLoading: boolean
}
export default function OsTable ({ordens, pagination, handleGetOrdens, isLoading}: OsTableProps) {
    return (
    <Card className="">
      <CardHeader className="border-b-2 pb-4 flex flex-col">
        <div className="flex flex-row justify-between w-full">
          <CardTitle className="text-lg font-medium">
            Ordens de Serviço{" "}
            <span className="text-muted-foreground text-xs font-mono font-extralight">
              |EM PAGAMENTO
            </span>
          </CardTitle>
          
        </div>
        <div
          onClick={() => {
            handleGetOrdens()
          }}
          className="flex flex-row space-x-1 items-center hover:cursor-pointer"
        >
          <Loader2 className="w-3 h-3" />
          <span className="text-xs text-muted-foreground"> Recarregar</span>
        </div>
      </CardHeader>
      <CardContent className="min-h-[300px] -mt-[24px] px-4 pb-4 pt-0 relative flex flex-col justify-between">
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
        <Table className=" text-xs mt-6">
          <TableHeader>
            <TableRow className="font-bold">
              <TableCell>Descrição</TableCell>
              <TableCell className="hidden md:table-cell">Data</TableCell>
              <TableCell className="hidden md:table-cell">Tipo</TableCell>
              <TableCell className="hidden md:table-cell">Categoria</TableCell>
              <TableCell className="hidden md:table-cell">Banco</TableCell>
              <TableCell className="hidden md:table-cell">Método</TableCell>
              <TableCell className="text-right">Valor</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordens.map((o) => (
             <TableRow>
                <TableCell className=" flex justify-end ">
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
                      
                     <DropdownMenuItem>
                        <DollarSign/> Faturar
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
              onClick={() =>
                handleGetOrdens()
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
                                handleGetOrdens()

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
                                handleGetOrdens()

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
                                handleGetOrdens()

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