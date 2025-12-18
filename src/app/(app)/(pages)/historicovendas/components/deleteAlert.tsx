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
} from "@/components/ui/alert-dialog";
import { Info } from "lucide-react";
import { ReactNode } from "react";

interface DeleteAlertProps {
  children?: ReactNode;
  onDelete: () => void;
  isAlertOpen: boolean;
  setIsAlertOpen: (value: boolean) => void;
  idToDelete: number;
}
export default function DeleteAlert({
  children,
  onDelete,
  isAlertOpen,
  setIsAlertOpen,
  idToDelete,
}: DeleteAlertProps) {
  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent onFocusOutside={() => console.log("teste")}>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
                Esta ação não pode ser desfeita. Deletará a venda e todos os
                dados atrelados a ela.<br/><br/>


               <span className="text-[10px] flex flex-row items-center gap-1">
                 <Info className="w-3 h-3"/> TRANSAÇÕES DA VENDA SERÃO EXCLUÍDAS.
                </span>
                 
               <span className="text-[10px] flex flex-row items-center gap-1 mt-1">
                 <Info className="w-3 h-3"/> PRODUTOS DA VENDA SERÃO EXTORNADOS AO ESTOQUE.
                </span>
                

             
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="hover:cursor-pointer">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className="hover:cursor-pointer"
            onClick={() => onDelete()}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
