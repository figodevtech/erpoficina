import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface EditContentProps {
  selectedEntradaId?: number;
}

export default function EditContent({ selectedEntradaId }: EditContentProps) {
  const [loadingEntrada, setIsloadingEntrada] = useState(false);
  
  const handleGetEntrada = () => {
    setIsloadingEntrada(true);
    try {
        
    } catch (error) {
        
    }
  }

  if (loadingEntrada) {
    return (
      <DialogContent className="h-dvh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className="flex h-full min-h-0 flex-col justify-center items-center">
          <div className="size-8 border-t-2 border-primary rounded-t-full animate-spin"></div>
          <span className="text-primary">Carregando</span>
        </div>
      </DialogContent>
    );
  } else {
    return (
      <DialogContent className="h-svh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
        <div className="flex h-full min-h-0 flex-col">
          <DialogHeader className="shrink-0 px-6 py-4 border-b">
            <DialogTitle>Entrada #{selectedEntradaId}</DialogTitle>
            <DialogDescription>
              Edite a entrada com fornecedor e itens. Depois, conclua.
            </DialogDescription>
          </DialogHeader>
          <div className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-6 space-y-4"></div>
        </div>
      </DialogContent>
    );
  }
}
