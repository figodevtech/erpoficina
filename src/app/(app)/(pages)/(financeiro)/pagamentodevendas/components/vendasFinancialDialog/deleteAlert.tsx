import { vendaStatus } from "@/app/(app)/(pages)/historicovendas/types";
import { StatusOS } from "@/app/(app)/(pages)/ordens/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ReactNode } from "react";

interface DeleteAlertProps{
    children?: ReactNode;
    handleDeleteTransaction: (value: number)=>void
    isAlertOpen: boolean
    setIsAlertOpen: (value: boolean)=>void
    idToDelete: number
    statusVenda?: vendaStatus | null
  
}
export default function DeleteAlert({children, handleDeleteTransaction, isAlertOpen, setIsAlertOpen, idToDelete, statusVenda}: DeleteAlertProps) {
  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent
      onFocusOutside={()=>console.log("teste")}>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            {statusVenda === "FINALIZADA" ?
            
            "Ordem de Serviço já conluída. Tem certeza que deseja deletar a transação? Está ação não pode ser desfeita e retornará a OS para o status de PAGAMENTO EM ABERTO."
            :
            "Esta ação não pode ser desfeita. Deletará a transação." 
          }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="hover:cursor-pointer">Cancelar</AlertDialogCancel>
          <AlertDialogAction className="hover:cursor-pointer" onClick={()=>handleDeleteTransaction(idToDelete)}>Continuar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
