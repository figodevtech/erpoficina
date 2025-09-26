import { Button } from "@/components/ui/button";
import { CustomerDialog } from "./customerDialogRegister/customerDialog";
import { useEffect, useState } from "react";

interface HeaderProps {
  selectedCustomerId: number | undefined
  setSelectedCustomerId: (value: number | undefined)=> void
  isOpen: boolean
  setIsOpen: (value: boolean)=> void
}
export default function Header({selectedCustomerId, setSelectedCustomerId, isOpen, setIsOpen} : HeaderProps) {
  const [] = useState(false)



  useEffect(()=>{
    if(selectedCustomerId){
      setIsOpen(true)
    }
  },[selectedCustomerId])
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          Gestão de Clientes
        </h1>
        <p className="text-muted-foreground text-pretty">
          Controle completo da base de clientes da oficina
        </p>
      </div>
      <div className="flex items-center gap-2">
        <CustomerDialog
        setSelectedCustomerId={setSelectedCustomerId}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        customerId={selectedCustomerId}
        >
          <Button className="hover:cursor-pointer">Novo Cliente</Button>
        </CustomerDialog>
      </div>

    </div>
  );
}