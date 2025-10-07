"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { StatusOS } from "../types";
import { useMemo } from "react";

export default function EquipesFilters({
  status,
  onStatusChange,
  q,
  onQueryChange,
}: {
  status: StatusOS;
  onStatusChange: (s: StatusOS) => void;
  q: string;
  onQueryChange: (v: string) => void;
}) {
  const tabs = useMemo(
    () =>
      (["TODAS", "ABERTA", "EM_ANDAMENTO", "AGUARDANDO_PECA", "CONCLUIDA", "CANCELADA"] as StatusOS[]).map((s) => (
        <TabsTrigger key={s} value={s} className="capitalize">
          {s.replaceAll("_", " ").toLowerCase()}
        </TabsTrigger>
      )),
    []
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <Tabs value={status} onValueChange={(v) => onStatusChange(v as StatusOS)} className="w-full">
        <TabsList className="grid grid-cols-3 sm:inline-flex sm:gap-2 w-full sm:w-auto">{tabs}</TabsList>
      </Tabs>
      <div className="flex-1" />
      <div className="w-full sm:w-80">
        <Input value={q} onChange={(e) => onQueryChange(e.target.value)} placeholder="Buscar por descrição…" />
      </div>
    </div>
  );
}
