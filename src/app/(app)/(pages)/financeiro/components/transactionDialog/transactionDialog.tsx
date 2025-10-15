"use client";
import { Dialog, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Children, ReactNode, useState } from "react";
import EditContent from "./editContent";
import RegisterContent from "./registerContent";
import { NewTransaction, Transaction, TransactionCustomer } from "../../types";

interface TransactionDialogProps {
  children?: ReactNode;
  transactionId?: number;
  setSelectedTransactionId?: (value: number | undefined) => void;
  open?: boolean;
  setOpen?: (value: boolean) => void;
  selectedTransactionId?: number | undefined;
}
export default function TransactionDialog({
  children,
  setSelectedTransactionId,
  selectedTransactionId,
  open,
  setOpen,
}: TransactionDialogProps) {
  const [newTransaction, setNewTransaction] = useState<NewTransaction>({});
  const [selectedCustomer, setSelectedCustomer] = useState<
    TransactionCustomer | undefined
  >(undefined);
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // sempre sincroniza o estado (controlado ou interno)
        if (setOpen) {
          setOpen(nextOpen);
        }

        if (!nextOpen) {
          setSelectedTransactionId?.(undefined);
          setNewTransaction({});
          setSelectedCustomer(undefined);
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      {selectedTransactionId ? (
        <EditContent
          transactionId={selectedTransactionId}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
        />
      ) : (
        <RegisterContent
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          dialogOpen={open}
          newTransaction={newTransaction}
          setNewTransaction={setNewTransaction}
          setSelectedTransactionId={setSelectedTransactionId}
        />
      )}
    </Dialog>
  );
}
