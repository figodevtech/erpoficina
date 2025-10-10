"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Select } from "@radix-ui/react-select";
import { Search } from "lucide-react";
import { Tipo_transacao } from "../types";

interface SearchFilterProps {
    search: string
    setSearch: (value: string)=> void
    setTipo: (value: Tipo_transacao | "") => void
    tipo: Tipo_transacao | ""

}
export default function SearchFilter ({setSearch, setTipo, tipo}: SearchFilterProps) {
    return(
        
          <div className="flex gap-6 flex-col-reverse md:flex-row w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, email ou telefone..."
                className="pl-10 not-dark:bg-white"
              />
            </div>
            <Select
              value={tipo || ""}
              onValueChange={
                (value) =>{

                  if(value === "TODOS"){
                    setTipo("")
                  }else{
                    setTipo(value as Tipo_transacao)
                    
                  }

                  }
                }
            >
              <SelectTrigger className="w-full md:w-2/6 hover:cursor-pointer not-dark:bg-white">
                <SelectValue placeholder="Todos"></SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value={"TODOS"}
                  className="hover:cursor-pointer"
                >
                  Todos
                </SelectItem>
                <SelectItem
                  value={Tipo_transacao.RECEITA}
                  className="hover:cursor-pointer"
                >
                  Receitas
                </SelectItem>
                <SelectItem
                  value={Tipo_transacao.DESPESA}
                  className="hover:cursor-pointer"
                >
                  Despesas
                </SelectItem>
                <SelectItem
                  value={Tipo_transacao.DEPOSITO}
                  className="hover:cursor-pointer"
                >
                  Depósitos
                </SelectItem>
                <SelectItem
                  value={Tipo_transacao.SAQUE}
                  className="hover:cursor-pointer"
                >
                  Saques
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
       
    )
}