import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { ReactNode, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import {
  BadgeCheck,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  Loader,
  Plus,
  Search,
  ShieldCheck,
  ShieldX,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Estoque_status, Pagination, Produto } from "../(pages)/estoque/types";
import formatarEmReal from "@/utils/formatarEmReal";
import { DialogProduto } from "../(pages)/estoque/components/dialog-produto/dialog-produto";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function hasPermission(user: any, permission: string) {
  const permissoes = Array.isArray(user?.permissoes) ? user.permissoes : [];
  return permissoes.map((p: any) => String(p).trim().toUpperCase()).includes(permission);
}

interface ProductSelectProps {
  children?: ReactNode;
  OnSelect?: (value: Produto) => void;
  setOpen?: (value: boolean) => void;
  open?: boolean;
}
export default function ProductSelect({
  children,
  OnSelect,
  setOpen,
  open,
}: ProductSelectProps) {
  const { data: session } = useSession();
  const canCreateProduct = hasPermission(session?.user, "ESTOQUE_ACESSO");
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [productItems, setProductItems] = useState<Produto[] | []>([]);
  const [search, setSearch] = useState("");
  const [openProduto, setOpenProduto] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<
    number | undefined
  >(undefined);

  const handleGetProducts = async (
    pageNumber?: number,
    limit?: number,
    searchText?: string,
    statusValue?: Estoque_status
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/products/select", {
        params: {
          page: pageNumber || 1,
          limit: pagination.limit,
          search: searchText || undefined,
          status: "TODOS",
        },
      });
      if (response.status === 200) {
        const { data } = response;
        setProductItems(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.log("Erro ao buscar Produtos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
    }
    handleGetProducts();
  }, [open]);

  useEffect(() => {
    handleGetProducts(pagination.page, pagination.limit, search);
  }, [pagination.limit, pagination.page]);

  useEffect(() => {
    handleGetProducts(1, pagination.limit, search);
  }, [search]);

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (setOpen) {
          setOpen(nextOpen);
        }

        if (!nextOpen) {
          setSearch("");
        }
      }}
      open={open}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="h-lvh min-w-screen max-h-[600px] p-0 overflow-hidden sm:max-w-[500px] sm:max-h-[600px] sm:w-[95vw] sm:min-w-0">
        <div className="flex h-full min-h-0 flex-col">
          <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
            <DialogTitle>Selecione um Produto</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
            <div className="flex flex-row items-center gap-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, email ou telefone..."
                  className="pl-10"
                />
              </div>
              {canCreateProduct && (
                <>
                  <Button
                    onClick={() => setOpenProduto(true)}
                    className="hover:cursor-pointer text-xs"
                    variant={"outline"}
                  >
                    <Plus /> Novo
                  </Button>
                  <DialogProduto
                    isOpen={openProduto}
                    setIsOpen={(open) => {
                      if (!open) {
                        setSelectedProductId(undefined);
                        handleGetProducts(1, pagination.limit, "");
                      }
                      setOpenProduto(open);
                    }}
                    productId={selectedProductId}
                    setSelectedProductId={setSelectedProductId}
                  />
                </>
              )}
            </div>

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
            <Table className="text-[10px] mt-6">
              <TableHeader>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>NOME</TableCell>
                  <TableCell className="hidden md:table-cell">FRABRICANTE</TableCell>
                  <TableCell>ESTOQUE</TableCell>
                  <TableCell>VALOR</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productItems.map((p) => (
                  <TableRow
                    className={`hover:cursor-pointer ${
                      p.estoque === 0 && "bg-red-500/5 text-red-400"
                    }`}
                    onClick={() => {
                      if (OnSelect) {
                        OnSelect(p);
                      }
                      if (setOpen) {
                        setOpen(false);
                        setSearch("");
                      }
                    }}
                    key={p.id}
                  >
                    <TableCell>{p.id}</TableCell>
                    <TableCell className="max-w-[120px] truncate">
                      <div className="flex flex-col md:hidden">
                        <span>
                      {p.titulo}

                        </span>
                        <span>{p.fabricante}</span>
                      </div>
                      <div className="hidden md:flex flex-row gap-2 items-center">
                          <p className="font-medium max-w-[350px] truncate">{p.titulo || "-"}</p>
                          
                          {p.conservacao && p.conservacao === "NOVO" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>

                              <BadgeCheck className="w-3 h-3 text-primary" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Produto Novo</TooltipContent>
                            </Tooltip>
                            )}
                          {p.conservacao && p.conservacao === "USADO" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>

                                <ShieldX className="w-3 h-3 text-yellow-500" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Produto Usado</TooltipContent>
                            </Tooltip>
                            )}
                          {p.conservacao && p.conservacao === "RECONDICIONADO" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>

                                <ShieldCheck className="w-3 h-3 text-green-500" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Produto Recondicionado</TooltipContent>
                            </Tooltip>
                            )}
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[120px] truncate"> 
                      
                      {p.fabricante || "-"}
                      </TableCell>
                    <TableCell>{p.estoque}</TableCell>
                    <TableCell>{formatarEmReal(p.precovenda || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter>
          <div className="flex flex-row items-center pb-5 w-full h-full justify-center">
            <div className="text-xs text-muted-foreground flex flex-nowrap">
              <span>{pagination.limit * (pagination.page - 1) + 1}</span> -{" "}
              <span>
                {pagination.limit * (pagination.page - 1) +
                  (pagination.pageCount || 0)}
              </span>
              <span className="ml-1 hidden sm:block">
                de {pagination.total}
              </span>
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
                onClick={() => handleGetProducts(1, pagination.limit, search)}
                disabled={pagination.page === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:cursor-pointer"
                onClick={() =>
                  handleGetProducts(
                    pagination.page - 1,
                    pagination.limit,
                    search
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
                  handleGetProducts(
                    pagination.page + 1,
                    pagination.limit,
                    search
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
                  handleGetProducts(
                    pagination.totalPages,
                    pagination.limit,
                    search
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
