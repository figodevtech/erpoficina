import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Select } from "@radix-ui/react-select";
import { Search } from "lucide-react";
import { Status } from "../types";

interface SearchFilterProps {
    search: string
    setSearch: (value: string)=> void
    setStatus: (value: Status) => void
    status: Status

}
export default function SearchFilter ({setSearch, setStatus, status}: SearchFilterProps) {
    return(
        <Card>
        <CardContent className="pt-6">
          <div className="flex gap-6 flex-col md:flex-row">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, email ou telefone..."
                className="pl-10"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as Status)}
            >
              <SelectTrigger className="w-full md:w-2/6 hover:cursor-pointer">
                <SelectValue placeholder="Todos"></SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value={Status.TODOS}
                  className="hover:cursor-pointer"
                >
                  Todos
                </SelectItem>
                <SelectItem
                  value={Status.ATIVO}
                  className="hover:cursor-pointer"
                >
                  Ativos
                </SelectItem>
                <SelectItem
                  value={Status.INATIVO}
                  className="hover:cursor-pointer"
                >
                  Inativos
                </SelectItem>
                <SelectItem
                  value={Status.PENDENTE}
                  className="hover:cursor-pointer"
                >
                  Pendentes
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    )
}