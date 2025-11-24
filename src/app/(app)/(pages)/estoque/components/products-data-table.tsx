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
  AlertTriangle,
  Clock,
  ChevronDown,
  Trash2Icon,
  ChevronsRight,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronsLeft,
  Loader2,
  Edit,
  Loader,
  CircleOff,
  Store,
  Plus,
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
import { Estoque_status, Pagination, Produto } from "../types";
import { ProductDialog } from "./productDialog/productDialog";
import DeleteAlert from "./deleteAlert";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { useState } from "react";
import { ExportProductsButton } from "./exportProductsButton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import EntradaDialog from "./entradaDialog/entradaDialog";

interface ProductsDataTableProps {
  isLoading: boolean;
  products: Produto[];
  pagination: Pagination;
  search: string;
  handleGetProducts: (
    pageNumber?: number,
    limit?: number,
    search?: string,
    status?: Estoque_status
  ) => void;
  fetchStatusCounts: () => void;
  status: Estoque_status;

  // ✅ para edição via duplo clique (controlado no pai)
  selectedProductId?: number | undefined;
  setSelectedProductId?: (value: number | undefined) => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const getStatusBadge = (status: Estoque_status) => {
  if (status === "CRITICO") {
    return (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Crítico
      </Badge>
    );
  }
  if (status === "BAIXO") {
    return (
      <Badge
        variant="secondary"
        className="text-xs bg-yellow-600 not-dark:text-white"
      >
        <Clock className="h-3 w-3 mr-1" />
        Baixo
      </Badge>
    );
  }
  if (status === "SEM_ESTOQUE") {
    return (
      <Badge
        variant="secondary"
        className="text-xs bg-purple-800 not-dark:text-white"
      >
        <CircleOff className="h-3 w-3 mr-1" />
        Sem Estoque
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs">
      OK
    </Badge>
  );
};

export default function ProductsDataTable({
  isLoading,
  products,
  pagination,
  search,
  handleGetProducts,
  fetchStatusCounts,
  status,
  selectedProductId,
  setSelectedProductId,
  isOpen,
  setIsOpen,
}: ProductsDataTableProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isEntradaOpen, setIsEntradaOpen] = useState(false);
  const [, setIsDeleting] = useState(false);

  const handleDeleteProduct = async (id: number) => {
    setIsDeleting(true);
    toast(
      <div className="flex gap-2 items-center flex-nowrap">
        <Loader className=" animate-spin w-4" />
        <span className="text-nowrap">Deletando produto...</span>
      </div>
    );
    try {
      const response = await axios.delete(`/api/products/${id}`, {});
      if (response.status === 204) {
        toast.success("Produto deletado!");
        handleGetProducts(pagination.page, pagination.limit, search, status);
        fetchStatusCounts();
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

  return (
    <Card>
      {/* Cabeçalho da tabela com botão Novo Produto no canto superior direito */}
      <CardHeader className="border-b-2 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Lista de Produtos</CardTitle>
            <CardDescription>
              <button
                onClick={() => {
                  handleGetProducts(
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

          {/* 👉 Botão “Novo Produto” movido para cá */}
          <div className="flex items-center gap-2">
            <ExportProductsButton />
            <Button
              className="hover:cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              Novo Produto
            </Button>
          </div>
        </div>

        {/* ✅ Dialog controlado para edição (abre no duplo clique) */}
        <ProductDialog
          setSelectedProductId={setSelectedProductId}
          productId={selectedProductId}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
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
              <TableHead>Produto</TableHead>
              <TableHead>Referência</TableHead>
              <TableHead>Fabricante</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Mín.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Preço Unit.</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.map((p) => {
              const valorTotal = (p.estoque ?? 0) * p.precovenda;

              return (
                <TableRow
                  onDoubleClick={() => setSelectedProductId?.(p.id)}
                  key={p.id}
                  className="hover:cursor-pointer"
                >
                  <TableCell>{p.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="flex flex-row gap-2 items-center">
                          <p className="font-medium">{p.titulo}</p>
                          {p.exibirPdv && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Store className="w-4 h-4 text-primary/80 not-dark:text-primary" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Exibindo no Marketplace
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {p.unidade}
                          {p.fabricante ? ` • ${p.fabricante}` : ""}
                        </p>
                        {p.codigobarras && (
                          <p className="text-xs text-muted-foreground">
                            CODIGOBARRAS: {p.codigobarras}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs">
                    {p.referencia}
                  </TableCell>
                  <TableCell>{p.fabricante}</TableCell>

                  <TableCell className="font-medium">
                    {p.estoque ?? 0}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.estoqueminimo ?? 0}
                  </TableCell>

                  <TableCell>{getStatusBadge(p.status_estoque)}</TableCell>

                  <TableCell>
                    R{"$ "}
                    {p.precovenda.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
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
                        <ProductDialog productId={p.id}>
                          <Button
                            variant={"ghost"}
                            className="size-full flex justify-start gap-5 px-0 rounded-sm py-2 hover:cursor-pointer"
                          >
                            <Edit className="-ml-1 -mr-1 h-4 w-4" />
                            <span>Editar</span>
                          </Button>
                        </ProductDialog>
                        
                        <EntradaDialog
                        handleGetProducts={handleGetProducts}
                        status={status}
                        search={search}
                        isOpen={isEntradaOpen}
                        setIsOpen={setIsEntradaOpen}
                        currentQuantity={p.estoque ||  0}
                        productDescription={p.titulo || ""}
                        productId={p.id}
                        >
                          <Button
                            variant={"default"}
                            className="size-full flex justify-start gap-5 px-0 rounded-sm py-2 hover:cursor-pointer not-dark:text-gray-800  bg-green-500/20 hover:bg-green-500 group hover:text-white transition-all"
                          >
                            <Plus className="-ml-1 -mr-1 h-4 w-4" />
                            <span>Entrada</span>
                          </Button>
                        </EntradaDialog>
                        <DeleteAlert
                          handleDeleteProduct={handleDeleteProduct}
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
                handleGetProducts(1, pagination.limit, search, status)
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
                handleGetProducts(
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
                handleGetProducts(
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
                handleGetProducts(
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
      </CardContent>
    </Card>
  );
}
