import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { FileText, Search} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState } from "react";

import CustomerSelect from "@/app/(app)/components/customerSelect";
import { BotaoExportHistoricoCompras } from "./botao-export-cliente-compra";
import { Customer } from "../../../clientes/types";

export default function DialogClienteCompras() {
 
  const [selectedCliente, setSelectedCliente] = useState<Customer  | undefined>(undefined)
  const [openCliente, setOpenCliente]= useState(false)

  return (
    <Dialog>
      <DialogTrigger asChild>
       <Button
            variant="outline"
            className="h-auto hover:cursor-pointer flex-col items-start justify-start gap-2 p-4 text-left hover:bg-accent hover:text-accent-foreground bg-transparent"
          >
            <div className="flex w-full items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <FileText />
              </div>
              <span className="flex-1 font-medium">Hstórico de compras</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Compras realizadas por cliente
            </p>
          </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar Compras</DialogTitle>
          <DialogDescription>
            Selecione dados para gerar o relatório
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 bg-muted/50 p-4 rounded-2xl">
          <div className="flex flex-row gap-2 justify-between items-center">
            <Label>Cliente:</Label>
            <span className="text-[10px] truncate font-sans max-w-[300px]">

            {selectedCliente && selectedCliente.nomerazaosocial}
            </span>
            <CustomerSelect
            open={openCliente}
            setOpen={setOpenCliente}

            OnSelect={(c)=>setSelectedCliente(c)}
            />
                <div onClick={()=>setOpenCliente(true)} className="p-1.5 rounded-full bg-muted hover:cursor-pointer">

                    <Search className="w-3 h-3"/>
                </div>
          </div>
          
          
        </div>
        <DialogFooter className="flex flex-row items-center">
            <BotaoExportHistoricoCompras
              clienteId={selectedCliente?.id}
            />
          
          <DialogClose asChild>
            <Button className="hover:cursor-pointer">Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
