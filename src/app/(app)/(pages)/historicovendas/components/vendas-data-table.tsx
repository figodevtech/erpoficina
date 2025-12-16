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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Clock,
  ChevronDown,
  Trash2Icon,
  ChevronsRight,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronsLeft,
  Loader2,
  Loader,
  DollarSign,
  Check,
  EyeIcon,
  CreditCard,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Pagination, VendaComItens, vendaStatus } from "../types";
import { formatDate } from "@/utils/formatDate";
import formatarEmReal from "@/utils/formatarEmReal";
import DeleteAlert from "./deleteAlert";
import { GerarNotaDeOsDialog } from "../../ordens/components/dialogs/emissao-nota-dialog/gerarNotaDeOsDialog/gerarNotaDeOsDialog";
import { EmissaoNotaDialog } from "../../ordens/components/dialogs/emissao-nota-dialog/emissao-nota-dialog";
import { VendaDetailsDialog } from "./venda-detail-dialog";

interface VendasDataTableProps {
  vendas: VendaComItens[];
  isLoading: boolean;
  pagination: Pagination;
  search: string;
  handleGetVendas: (
    pageNumber?: number,
    limit?: number,
    searchText?: string,
    status?: vendaStatus | "TODOS"
  ) => void;
  fetchStatusCounts: () => void;
  status: vendaStatus | "TODOS";

  // ✅ para edição via duplo clique (controlado no pai)
  selectedVendaId?: number | undefined;
  setSelectedVendaId?: (value: number | undefined) => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const getStatusBadge = (status: vendaStatus) => {
  if (status === "ABERTA") {
    return (
      <Badge variant="secondary" className="text-xs bg-primary">
        <Clock className="h-3 w-3 mr-1" />
        ABERTA
      </Badge>
    );
  }
  if (status === "PAGAMENTO") {
    return (
      <Badge
        variant="secondary"
        className="text-xs bg-yellow-600 not-dark:text-white"
      >
        <DollarSign className="h-3 w-3 mr-1" />
        PAGAMENTO
      </Badge>
    );
  }
  if (status === "FINALIZADA") {
    return (
      <Badge
        variant="secondary"
        className="text-xs bg-gray-800 not-dark:text-white"
      >
        <Check className="h-3 w-3 mr-1" />
        FINALIZADA
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs">
      OK
    </Badge>
  );
};

const handleDeleteVenda = async () => {
  return
}

export default function VendasDataTable({
  isLoading,
  vendas,
  pagination,
  search,
  handleGetVendas,
  fetchStatusCounts,
  status,
}: VendasDataTableProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [openEmissao, setOpenEmissao] = useState(false)
  const [emissaoId, setEmissaoId] = useState <number | null>(null)
  const [selectedVendaId, setSelectedVendaId] = useState <number | null>(null)
  const [openDetails, setOpenDetails] = useState(false)
  return (
    <Card>
      <CardHeader className="border-b-2 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Lista de Vendas</CardTitle>
            <CardDescription>
              <button
                onClick={() => {
                  handleGetVendas(
                    pagination.page,
                    pagination.limit,
                    search,
                    status
                  );
                  fetchStatusCounts();
                }}
                className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground/70 hover:cursor-pointer"
              >
                <span>Recarregar</span>
                <Loader2
                  width={12}
                  className={isLoading ? "animate-spin" : ""}
                />
              </button>
            </CardDescription>
          </div>

          {/* <div className="flex items-center gap-2">
            <Button
              className="hover:cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              Nova Venda
            </Button>
          </div> */}
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

        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead className="text-center">Status</TableHead>

              <TableHead></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {vendas.map((p) => {
              return (
                <TableRow
                  onDoubleClick={() => setSelectedVendaId?.(p.id)}
                  key={p.id}
                  className="hover:cursor-pointer"
                >
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.cliente.nomerazaosocial}</TableCell>

                  <TableCell className="font-mono text-xs">
                    {formatDate(p.datavenda)}
                  </TableCell>
                  <TableCell>{formatarEmReal(p.valortotal)}</TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(p.status)}
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
                        <Button
                        onClick={()=>{
                          setEmissaoId(p.id)
                          setOpenEmissao(true)
                        }}
                          variant={"ghost"}
                          className="size-full flex justify-start gap-5 px-0 rounded-sm py-2 hover:cursor-pointer"
                        >
                          <CreditCard className="-ml-1 -mr-1 h-4 w-4" />
                          <span>Emissão de NF-e</span>
                        </Button>
                        <Button
                        onClick={()=> {
                          setSelectedVendaId(p.id)
                          setOpenDetails(true)
                        }}
                          variant={"ghost"}
                          className="size-full flex justify-start gap-5 px-0 rounded-sm py-2 hover:cursor-pointer"
                        >
                          <EyeIcon className="-ml-1 -mr-1 h-4 w-4" />
                          <span>Visualizar</span>
                        </Button>
                        

                        <DeleteAlert
                          handleDeleteVenda={handleDeleteVenda}
                          isAlertOpen={isAlertOpen}
                          setIsAlertOpen={setIsAlertOpen}
                          idToDelete={p.id}
                        >
                          <Button
                            variant={"default"}
                            className="size-full flex justify-start gap-5 px-0 rounded-sm py-2 hover:cursor-pointer not-dark:text-gray-800 bg-red-500/20 hover:bg-red-500 group hover:text-white transition-all"
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
          <div className="text-xs text-muted-foreground flex flex-nowrap">
            <span>{pagination.limit * (pagination.page - 1) + 1}</span> -{" "}
            <span>
              {pagination.limit * (pagination.page - 1) +
                (pagination.pageCount || 0)}
            </span>
            <span className="ml-1 hidden sm:block">de {pagination.total}</span>
            <Loader
              className={`w-4 h-full animate-spin transition-all opacity-0 ${
                isLoading && "opacity-100"
              }`}
            />
          </div>

          <div className="flex items-center justify-center space-x-1 sm:space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="hover:cursor-pointer"
              onClick={() =>
                handleGetVendas(1, pagination.limit, search, status)
              }
              disabled={pagination.page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover:cursor-pointer"
              onClick={() =>
                handleGetVendas(
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
            <span className="text-[10px] sm:text-xs font-medium text-nowrap">
              Pg. {pagination.page} de {pagination.totalPages || 1}
            </span>
            <Button
              className="hover:cursor-pointer"
              variant="outline"
              size="sm"
              onClick={() =>
                handleGetVendas(
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
              size="sm"
              onClick={() =>
                handleGetVendas(
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
      <EmissaoNotaDialog
      onOpenChange={setOpenEmissao}
      open={openEmissao}
      vendaId={emissaoId}
      />
      </CardContent>
      <VendaDetailsDialog
                        vendaId={selectedVendaId}
                        onOpenChange={setOpenDetails}
                        open={openDetails}
                        />
    </Card>
  );
}
