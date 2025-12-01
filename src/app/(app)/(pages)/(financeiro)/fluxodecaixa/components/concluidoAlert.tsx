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
    isAlertOpen: boolean
    setIsAlertOpen: (value: boolean)=>void
    idConcluido: number
    handleSetConcluido: (id: number)=> void
  
}
export default function ConculidoAlert({children, handleSetConcluido, isAlertOpen, setIsAlertOpen, idConcluido}: DeleteAlertProps) {
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
            Esta ação modificará o pagamento pendente para CONCLUÍDO.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="hover:cursor-pointer">Cancelar</AlertDialogCancel>
          <AlertDialogAction className="hover:cursor-pointer" onClick={()=>handleSetConcluido(idConcluido)}>Continuar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
