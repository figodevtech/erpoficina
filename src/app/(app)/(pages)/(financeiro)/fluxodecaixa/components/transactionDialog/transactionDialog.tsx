"use client";
import { Dialog,  DialogTrigger } from "@/components/ui/dialog";
import { ReactNode, useState } from "react";
import EditContent from "./editContent";
import RegisterContent from "./registerContent";
import { NewTransaction, Tipo_transacao, TransactionCustomer } from "../../types";

interface TransactionDialogProps {
  children?: ReactNode;
  osId?: number
  vendaId?: number
  transactionId?: number;
  setSelectedTransactionId?: (value: number | undefined) => void;
  open?: boolean;
  setOpen?: (value: boolean) => void;
  selectedTransactionId?: number | undefined;
  handleGetTransactions?: (pageNumber?: number) => void
}
export default function TransactionDialog({
  children,
  setSelectedTransactionId,
  selectedTransactionId,
  open,
  osId,
  vendaId,
  setOpen,
  handleGetTransactions,
}: TransactionDialogProps) {
  const [newTransaction, setNewTransaction] = useState<NewTransaction>({});
  const [selectedCustomer, setSelectedCustomer] = useState<
    TransactionCustomer | undefined
  >(undefined);


  return (
    <Dialog
      open={open}
  onOpenChange={(nextOpen) => {
    if (setOpen) setOpen(nextOpen);

    if (nextOpen) {
      if (osId) {
        setNewTransaction({
          ordemservicoid: osId,
          tipo: Tipo_transacao.RECEITA,
          categoria: "ORDEM DE SERVIÇO",
          descricao: `Pagamento da OS #${osId}`,
          valor: 0,
          valorLiquido: 0
        });
      }

      if(vendaId){
        setNewTransaction({
          vendaid: vendaId,
          tipo: Tipo_transacao.RECEITA,
          categoria: "VENDA",
          descricao: `Pagamento da Venda #${vendaId}`,
          valor: 0,
          valorLiquido: 0
        });
      }
      
      if(!osId && !vendaId) {
        setNewTransaction({});
      }

      return;
    }

    // ao fechar, limpa estados
    if (setSelectedTransactionId) setSelectedTransactionId(undefined);
    setNewTransaction({});
    setSelectedCustomer(undefined);
  }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      {selectedTransactionId ? (
        <EditContent
          selectedTransactionId={selectedTransactionId}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
        />
      ) : (
        <RegisterContent
        vendaId={vendaId}
        osId={osId}
        handleGetTransactions={handleGetTransactions}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          dialogOpen={open}
          newTransaction={newTransaction}
          setNewTransaction={setNewTransaction}
          setSelectedTransactionId={setSelectedTransactionId}
          setOpen={setOpen}
        />
      )}
    </Dialog>
  );
}
