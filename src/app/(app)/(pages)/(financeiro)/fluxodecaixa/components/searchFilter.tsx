"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
// ✅ use sempre o Select do shadcn
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Pagination, Tipo_transacao } from "../types";
import { Label } from "@/components/ui/label";

interface SearchFilterProps {
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
  dateFrom: string;
  dateTo: string;
  search: string;
  setSearch: (value: string) => void;
  setTipo: (value: Tipo_transacao | "") => void;
  tipo: Tipo_transacao | "";
  handleGetTransactions: (
    pageNumber?: number,
    limit?: number,
    search?: string,
    tipo?: Tipo_transacao | ""
  ) => void;
  pagination: Pagination;
}

export default function SearchFilter({
  setSearch,
  setTipo,
  tipo,
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
}: SearchFilterProps) {
  // 👇 IDs estáveis para o Select
  const uid = React.useId();
  const listboxId = `${uid}-tipo-listbox`;

  return (
    <div className="flex flex-col w-full gap-3">

      <div className="flex flex-col-reverse md:flex-row gap-6">

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
        onValueChange={(value) => {
          if (value === "TODOS") setTipo("");
          else setTipo(value as Tipo_transacao);
        }}
      >
        <SelectTrigger
          className="w-full md:w-2/6 hover:cursor-pointer not-dark:bg-white"
          aria-controls={listboxId}             // <- estável
        >
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent id={listboxId}>          {/* <- estável */}
          <SelectItem value="TODOS" className="hover:cursor-pointer">
            Todos
          </SelectItem>
          <SelectItem value={Tipo_transacao.RECEITA} className="hover:cursor-pointer">
            Receitas
          </SelectItem>
          <SelectItem value={Tipo_transacao.DESPESA} className="hover:cursor-pointer">
            Despesas
          </SelectItem>
          <SelectItem value={Tipo_transacao.DEPOSITO} className="hover:cursor-pointer">
            Depósitos
          </SelectItem>
          <SelectItem value={Tipo_transacao.SAQUE} className="hover:cursor-pointer">
            Saques
          </SelectItem>
        </SelectContent>
      </Select>
      </div>

      {/* FILTRO DE DATA */}
      <div className="flex flex-row md:flex-row gap-6">
        <div className="flex flex-row gap-2">

        <Label>De:</Label>
        <Input value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)}  type="date" name="dateFrom" id="" />
        </div>
        <div className="flex flex-row gap-2">
          <Label>Até:</Label>
        <Input value={dateTo} onChange={(e)=>setDateTo(e.target.value)} type="date" name="dateTo" id="" />
        </div>

      </div>
    </div>
  );
}
