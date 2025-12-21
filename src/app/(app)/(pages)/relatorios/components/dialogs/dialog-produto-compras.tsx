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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import { Categoria_transacao, Tipo_transacao } from "../../../(financeiro)/fluxodecaixa/types";
import CustomerSelect from "@/app/(app)/components/customerSelect";
import { BotaoExportHistoricoCompras } from "./botao-export-cliente-compra";
import { Customer } from "../../../clientes/types";
import ProductSelect from "@/app/(app)/components/productSelect";
import { Produto } from "../../../estoque/types";
import { BotaoExportProdutoVendas } from "./botao-export-produto-vendas";

export default function DialogProdutoCompras() {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  // const [categoria, setCategoria] = useState<Categoria_transacao | "">("");
  const [selectedProdutc, setSelectedProduct] = useState<Produto  | undefined>(undefined)
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
                <PieChart />
              </div>
              <span className="flex-1 font-medium">Vendas por Produto</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Histórico de vendas realizadas de um produto
            </p>
          </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar vendas</DialogTitle>
          <DialogDescription>
            Selecione dados para gerar o relatório
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 bg-muted/50 p-4 rounded-2xl">
          <div className="flex flex-col gap-2">
            <Label>Cliente:</Label>
            <ProductSelect
            setOpen={setOpen}
            open={open}
            OnSelect={(p)=>setSelectedProduct(p)}
            />
            <div className="w-full flex flex-row gap-1 items-center">

            <Input className="hover:cursor-pointer text-xs h-8" type="text" disabled value={selectedProdutc?.titulo || "Selecione o produto"}/>
            {selectedProdutc?.id ? (

            <div onClick={()=> setSelectedProduct(undefined)} className="p-1.5 rounded-full bg-muted h-min hover:cursor-pointer">
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
            <BotaoExportProdutoVendas
            produtoId={selectedProdutc?.id}
            
            />
          
          <DialogClose asChild>
            <Button className="hover:cursor-pointer">Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
