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
import { FileText, PieChart, Search, X } from "lucide-react";
import { ExportTransactionsButton } from "../../../(financeiro)/fluxodecaixa/components/ExportTransactionsButton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Categoria_transacao, Tipo_transacao } from "../../../(financeiro)/fluxodecaixa/types";
import CustomerSelect from "@/app/(app)/components/customerSelect";
import { BotaoExportHistoricoCompras } from "./botao-export-cliente-compra";
import { Customer } from "../../../clientes/types";

export default function DialogClienteCompras() {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [categoria, setCategoria] = useState<Categoria_transacao | "">("");
  const [selectedCliente, setSelectedCliente] = useState<Customer  | undefined>(undefined)
  const [open, setOpen] = useState(false)
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
          <div className="flex flex-col gap-2">
            <Label>Cliente:</Label>
            <CustomerSelect
            setOpen={setOpen}
            open={open}
            OnSelect={(c)=>setSelectedCliente(c)}
            />
            <div className="w-full flex flex-row gap-1 items-center">

            <Input className="hover:cursor-pointer text-xs h-8" type="text" disabled value={selectedCliente?.nomerazaosocial || "Selecione o cliente"}/>
            {selectedCliente?.id ? (

            <div onClick={()=> setSelectedCliente(undefined)} className="p-1.5 rounded-full bg-muted h-min hover:cursor-pointer">
              <X className="w-3 h-3 text-red-500"/>
            </div>

            ):(

            <div onClick={()=>(setOpen(true))} className="p-1.5 rounded-full bg-muted h-min hover:cursor-pointer">
              <Search className="w-3.5 h-3.5"/>
            </div>
            )}
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
