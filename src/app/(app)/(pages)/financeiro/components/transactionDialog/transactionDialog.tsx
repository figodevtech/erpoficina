"use client"
import { Dialog, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Children, ReactNode, useState } from "react";
import EditContent from "./editContent";
import RegisterContent from "./registerContent";
import { NewTransaction, Transaction } from "../../types";

interface TransactionDialogProps {
      children?: ReactNode;
      transactionId?: number
    setSelectedTransactionId?: (value: number | undefined)=> void
}
export default function TransactionDialog({children, transactionId, setSelectedTransactionId}: TransactionDialogProps) {
    const [newTransaction, setNewTransaction] = useState<NewTransaction>({
        
    })
    return(
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
        {transactionId ? (
            <EditContent/>
        ):
            <RegisterContent
            newTransaction={newTransaction}
            setNewTransaction={setNewTransaction}
            setSelectedTransactionId={setSelectedTransactionId}
            
            />
        }
        </Dialog>
    )
}