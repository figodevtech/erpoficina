import { Ordem } from "@/app/(app)/(pages)/ordens/types";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import formatarEmReal from "@/utils/formatarEmReal";
import {  Transaction } from "../../../fluxodecaixa/types";
import { useEffect, useState } from "react";
import axios, { isAxiosError } from "axios";
import TransactionDialog from "../../../fluxodecaixa/components/transactionDialog/transactionDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Loader, Loader2, Trash2Icon } from "lucide-react";
import DeleteAlert from "./deleteAlert";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";

interface OsContentProps {
  osId: number;
  IsOpen?: boolean;
}

// Ajuste conforme a sua estrutura real

export default function OsContent({ osId, IsOpen }: OsContentProps) {


  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOs, setIsLoadingOs] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [ordem, setOrdem] = useState<Ordem | undefined>(undefined);
  const [, setIsDeleting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [open, setOpen] = useState(false);

  // ====== DATA LOADERS
  const handleGetOrdem = async (
    osId: number,
  ) => {
    setIsLoadingOs(true);
    try {
      const response = await axios.get(`/api/ordens/${osId}`);
      if (response.status === 200) {
        setOrdem(response.data.os);
      }
    } catch (error) {
      console.log("Erro ao buscar Ordem:", error);
      toast.error("Não foi possível carregar a OS");
    } finally {
      setIsLoadingOs(false);
    }
  };

  const handleGetTransactions = async (pageNumber?: number) => {
    if (!ordem?.id) return;
    setIsLoading(true);
    try {
      const response = await axios.get("/api/transaction", {
        params: {
          page: pageNumber || 1,
          limit: pagination.limit,
          ordemservicoid: ordem.id,
        },
      });
      if (response.status === 200) {
        const { data } = response;
        setTransactions(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.log("Erro ao buscar Transações:", error);
      toast.error("Não foi possível carregar as transações");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(()=> {
    if(!IsOpen){
      setTransactions([]);
      setOrdem(undefined);
      }
    },[IsOpen])

  const handleDeleteTransaction = async (id: number) => {
    setIsDeleting(true);
    toast(
      <div className="flex gap-2 items-center flex-nowrap">
        <Loader className="animate-spin w-4" />
        <span className="text-nowrap">Deletando transação...</span>
      </div>
    );
    try {
      const response = await axios.delete(`/api/transaction/${id}/os`);
      if (response.status === 204) {
        handleGetTransactions(pagination.page);
        toast.success("Transação deletada!");
      } else {
        toast.warning(`Status inesperado: ${response.status}`);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error("Erro ao deletar", {
          description: error.response?.data?.error || "Tente novamente.",
        });
      } else {
        toast.error("Erro ao deletar");
      }
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
    }
  };

  // ====== EFFECTS
  useEffect(() => {
    if (ordem?.id) {
      handleGetTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordem?.id]);

  useEffect(() => {
    if (osId) {
      handleGetOrdem(osId);
    }
  }, [osId]);



  // ====== RENDER
  if (isLoadingOs) {
    return (
      <DialogContent className="h-dvh w-[100svw] max-w-[100svw] p-0 overflow-hidden rounded-none sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:rounded-2xl">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className="flex h-full min-h-0 flex-col justify-center items-center">
          <div className="size-8 border-t-2 border-primary rounded-t-full animate-spin"></div>
          <span className="text-primary">Carregando</span>
        </div>
      </DialogContent>
    );
  }

  if (!ordem) return null;

  return (
    <DialogContent className="h-svh w-[100svw] max-w-[100svw] p-0 overflow-hidden rounded-none sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:rounded-2xl">
      <div className="flex h-full min-h-0 min-w-0 flex-col">
        <DialogHeader className="shrink-0 px-6 py-4 border-b">
          <DialogTitle>
            OS #{ordem.id}{" "}
            <span className="text-muted-foreground text-sm font-light">
              {" "}
              | PAGAMENTOS{" "}
            </span>
          </DialogTitle>
          <DialogDescription>Pagamentos da OS</DialogDescription>
        </DialogHeader>

        {/* Barra de progresso fina no topo */}
        <div
          className={`transition-all ${
            isLoading ? "opacity-100" : "opacity-0"
          } h-0.5 bg-slate-400 w-full overflow-hidden left-0 right-0 top-0 relative`}
        >
          <div
            className={`w-1/2 bg-primary h-full absolute left-0 rounded-lg -translate-x-[100%] ${
              isLoading ? "animate-slideIn" : ""
            }`}
          />
        </div>

        <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden min-w-0 dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
          <div className="flex flex-row justify-end">
            
            <TransactionDialog
              handleGetTransactions={handleGetTransactions}
              osId={ordem.id}
              open={open}
              setOpen={setOpen}
            >
              <Button
              disabled={ordem.status === "CONCLUIDO"}
              className="hover:cursor-pointer">Novo pagamento</Button>
            </TransactionDialog>
          </div>

          <h1>Transações: {transactions.length}</h1>
          <Separator />

          <div
            className="flex flex-row text-[12px] items-center space-x-1 hover:cursor-pointer"
            onClick={() => handleGetTransactions()}
          >
            <span>Recarregar</span>
            <Loader2 className="w-[12px]" />
          </div>

          {/* WRAPPER para rolagem horizontal no mobile */}
          <div className="w-full min-w-0 overflow-x-auto">
            <Table className="w-full table-fixed text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead className="w-[220px]">DESCRIÇÃO</TableHead>
                  <TableHead className="w-[120px]">DATA</TableHead>
                  <TableHead className="w-[220px]">BANCO/MÉTODO</TableHead>
                  <TableHead className="w-[120px]">VALOR</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <TableRow key={t.id} className="hover:cursor-pointer">
                      <TableCell className="whitespace-nowrap">
                        {t.id}
                      </TableCell>
                      <TableCell
                        className="truncate max-w-[140px] sm:max-w-[220px]"
                        title={t.descricao || "-"}
                      >
                        {t.descricao}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(t.data)}
                      </TableCell>
                      <TableCell
                        className="truncate max-w-[160px] sm:max-w-[220px]"
                        title={`${t.banco?.titulo ?? "-"} - ${
                          t.metodopagamento ?? "-"
                        }`}
                      >
                        {t.banco?.titulo} - {t.metodopagamento}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span>{formatarEmReal(t.valor)}</span>
                          <span className="text-xs text-muted-foreground">
                            Líquido: {formatarEmReal(t.valorLiquido)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 cursor-pointer"
                              aria-label="Ações"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="space-y-1 w-40"
                            align="end"
                          >
                            <DeleteAlert
                              statusOs={ordem.status}
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="col-span-full">
                      Sem Transações
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex flex-col w-full justify-start text-xs gap-2">
            <span className="text-sm">Resumo:</span>
            <Separator />
            <div className="flex flex-row items-center space-x-1 w-full">
              <span className="text-nowrap">Total a Pagar:</span>
              <div className="w-full border-b h-full border-dashed"></div>
              <h1>{formatarEmReal(ordem.orcamentototal || 0)}</h1>
            </div>
            <div className="flex flex-row items-center space-x-1 w-full">
              <span className="text-nowrap">Total Pago:</span>
              <div className="w-full border-b h-full border-dashed"></div>
              <h1 className="text-blue-500 font-bold">
                {formatarEmReal(
                  transactions?.reduce(
                    (acc, t) => acc + Number(t?.valor ?? 0),
                    0
                  ) ?? 0
                )}
              </h1>
            </div>
            <div className="flex flex-row items-center space-x-1 w-full">
              <span className="text-nowrap">Saldo Devedor:</span>
              <div className="w-full border-b h-full border-dashed"></div>
              <h1 className="font-bold text-gray-400">
                {formatarEmReal(
                  (ordem.orcamentototal || 0) -
                    (transactions?.reduce(
                      (acc, t) => acc + Number(t?.valor ?? 0),
                      0
                    ) ?? 0)
                )}
              </h1>
            </div>
            <div className="w-full flex flex-col space-y-1"></div>
          </div>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}
