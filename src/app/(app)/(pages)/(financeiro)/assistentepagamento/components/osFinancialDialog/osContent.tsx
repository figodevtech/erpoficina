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
} from "@/components/ui/table";
import formatarEmReal from "@/utils/formatarEmReal";
import { Tipo_transacao, Transaction } from "../../../fluxodecaixa/types";
import { useEffect, useState } from "react";
import axios, { isAxiosError } from "axios";
import { Servico } from "@/types/servico";
import TransactionDialog from "../../../fluxodecaixa/components/transactionDialog/transactionDialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Loader, Trash2Icon } from "lucide-react";
import DeleteAlert from "./deleteAlert";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";

interface OsContentProps {
  osId: number;
}

interface ItemProduto {}
export default function OsContent({ osId }: OsContentProps) {
  interface ItemServico {
    ordemservicoid: number;
    servicoid: number;
    quantidade: number;
    precounitario: number;
    subtotal: number;
    servico: Servico;
  }

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
  const [itensProduto, setItensProduto] = useState<ItemProduto[]>([]);
  const [itensServico, setItensServico] = useState<ItemServico[]>([]);
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const handleGetOrdem = async (
    osId: number,
    pageNumber?: number,
    limit?: number,
    search?: string,
    tipo?: Tipo_transacao | ""
  ) => {
    setIsLoadingOs(true);
    try {
      const response = await axios.get("/api/ordens/" + osId, {});
      if (response.status === 200) {
        console.log("achou a ordem", response.data);
        setOrdem(response.data.os);
        setItensProduto(response.data.itensProduto);
        setItensServico(response.data.itensServico);
      }
    } catch (error) {
      console.log("Erro ao buscar Ordem:", error);
    } finally {
      setIsLoadingOs(false);
    }
  };

  const handleGetTransactions = async (
    pageNumber?: number,
    limit?: number,
    search?: string,
    tipo?: Tipo_transacao | ""
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/transaction", {
        params: {
          page: pageNumber || 1,
          limit: pagination.limit,
          ordemservicoid: ordem?.id,
        },
      });
      if (response.status === 200) {
        // console.log(response)
        const { data } = response;
        setTransactions(data.data);
        setPagination(data.pagination);
        console.log("Transações carregadas:", data.data);
      }
    } catch (error) {
      console.log("Erro ao buscar Transações:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        handleGetTransactions(pagination.page)
        toast("Transação deletada!");
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

  useEffect(() => {
    if (ordem?.id) {
      handleGetTransactions();
    }
  }, [ordem?.id]);

  useEffect(() => {
    if (osId) {
      handleGetOrdem(osId);
    }
  }, []);

  useEffect(() => {
    console.log("mudou itens", itensServico);
  }, [itensServico]);

  if (isLoadingOs) {
    return (
      <DialogContent className="h-dvh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
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
  if (ordem) {
    return (
      <DialogContent className="h-svh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
        <div className="flex h-full min-h-0 flex-col">
          <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
            <DialogTitle>
              OS #{ordem.id}{" "}
              <span className="text-muted-foreground text-sm font-light">
                | PAGAMENTOS
              </span>
            </DialogTitle>
            <DialogDescription>Pagamentos da OS</DialogDescription>
          </DialogHeader>
          <div
            className={`${
              isLoading && " opacity-100"
            } transition-all opacity-0 h-0.5 bg-slate-400 w-full overflow-hidden left-0 right-0 top-0 relative`}
          >
            <div
              className={`w-1/2 bg-primary h-full  absolute left-0 rounded-lg  -translate-x-[100%] ${
                isLoading && "animate-slideIn "
              } `}
            ></div>
          </div>
          <div className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
            <div className="flex flex-row justify-end">
              <TransactionDialog
              osId={ordem.id}
              >
                <Button className="hover:cursor-pointer">Novo pagamento</Button>
              </TransactionDialog>
            </div>
            <h1>Transações: {transactions.length}</h1>
            <Separator />
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="">
                  <TableCell>ID</TableCell>
                  <TableCell>DESCRIÇÃO</TableCell>
                  <TableCell>DATA</TableCell>
                  <TableCell>BANCO/MÉTODO</TableCell>
                  <TableCell>VALOR</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <TableRow key={t.id} className="hover:cursor-pointer">
                      <TableCell>{t.id}</TableCell>
                      <TableCell>{t.descricao}</TableCell>
                      <TableCell>{formatDate(t.data)}</TableCell>
                      <TableCell>
                        {t.banco.titulo} - {t.metodopagamento}
                      </TableCell>
                      <TableCell>{formatarEmReal(t.valor)}</TableCell>
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

                      <DropdownMenuContent
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
          <DialogFooter className="px-6 py-4">
            <div className="flex flex-col w-full gap-3 sm:gap-4 justify-start">
              <span className="text-sm">Total Geral:</span>
              <h1>{formatarEmReal(ordem.orcamentototal || 0)}</h1>
              <Separator />
              <div className="w-full flex flex-col space-y-1"></div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    );
  }
}
