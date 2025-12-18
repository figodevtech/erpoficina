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
import { ReactNode } from "react";

interface DeleteAlertProps {
  children?: ReactNode;
  handleDeleteProduct: (value: number) => void;
  isAlertOpen: boolean;
  setIsAlertOpen: (value: boolean) => void;
  idToDelete?: number;
}
export default function DeleteAlert({
  children,
  handleDeleteProduct,
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
            Esta ação não pode ser desfeita. Deletará o produto e todos os dados atrelados a ele.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="hover:cursor-pointer">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="hover:cursor-pointer"
            onClick={() => {
              if (!idToDelete) return;
              handleDeleteProduct(idToDelete);
            }}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
