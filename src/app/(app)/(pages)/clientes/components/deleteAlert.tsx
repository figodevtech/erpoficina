import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteAlertProps {
  handleDeleteUser: (value: number) => void;
  isAlertOpen: boolean;
  setIsAlertOpen: (value: boolean) => void;
  idToDelete: number | null; // ✅ permite “nenhum selecionado”
}

export default function DeleteAlert({
  handleDeleteUser,
  isAlertOpen,
  setIsAlertOpen,
  idToDelete,
}: DeleteAlertProps) {
  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Deletará o cliente e todos os dados atrelados a ele.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel className="hover:cursor-pointer w-full sm:w-auto">
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            className="hover:cursor-pointer w-full sm:w-auto"
            onClick={() => {
              if (idToDelete == null) return;
              handleDeleteUser(idToDelete);
            }}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
