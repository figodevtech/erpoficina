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
import { status } from "nprogress";
import { ReactNode } from "react";

interface DeleteAlertProps{
    children?: ReactNode;
    handleDeleteTransaction: (value: number)=>void
    isAlertOpen: boolean
    setIsAlertOpen: (value: boolean)=>void
    idToDelete: number
    statusOs?: StatusOS | null
  
}
export default function DeleteAlert({children, handleDeleteTransaction, isAlertOpen, setIsAlertOpen, idToDelete, statusOs}: DeleteAlertProps) {
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
            {statusOs === "CONCLUIDO" ?
            
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
