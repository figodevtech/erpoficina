"use client";
import { Dialog,  DialogTrigger } from "@/components/ui/dialog";
import { ReactNode, useState } from "react";
import EditContent from "./editContent";
import RegisterContent from "./registerContent";
import { Categoria_transacao, NewTransaction, Tipo_transacao, TransactionCustomer } from "../../types";

interface TransactionDialogProps {
  children?: ReactNode;
  osId?: number
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
          categoria: Categoria_transacao.ORDEM_SERVICO,
          descricao: `Pagamento da OS #${osId}`,
          valor: 0,
          valorLiquido: 0
        });
      } else {
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
