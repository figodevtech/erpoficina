"use client";

import { useCallback, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ServicoBusca } from "../tipos";

type Props = {
  onAdicionar: (s: ServicoBusca) => void;
  className?: string;
};

const money = (n: number | string | null | undefined) =>
  (typeof n === "number" ? n : Number(n ?? 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function BuscaServicos({ onAdicionar, className }: Props) {
  const [q, setQ] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<ServicoBusca[]>([]);

  const buscar = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL("/api/servicos/buscar", window.location.origin);
      if (q.trim()) url.searchParams.set("q", q.trim());
      if (codigo.trim()) url.searchParams.set("codigo", codigo.trim());
      const r = await fetch(url.toString(), { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Erro ao buscar serviços");

      const items: ServicoBusca[] = (Array.isArray(j?.servicos) ? j.servicos : []).map((s: any) => ({
        id: Number(s.id),
        codigo: String(s.codigo ?? ""),
        descricao: String(s.descricao ?? ""),
        precohora: Number(s.precohora ?? 0),
      }));

      setResultados(items);
      if (items.length === 0) toast.message("Nenhum serviço encontrado");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao buscar serviços");
      setResultados([]);
    } finally {
      setLoading(false);
    }
  }, [q, codigo]);

  return (
    <div className={className}>
      {/* Filtros (densos, alinhados com o card de itens) */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1 space-y-1.5">
          <Label>Pesquisar por descrição / CNAE / item da lista</Label>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder="Ex.: revisão, alinhamento..."
            className="h-10"
          />
        </div>

        <div className="w-full space-y-1.5 sm:w-56">
          <Label>Código</Label>
          <Input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder="Ex.: S-000321"
            className="h-10"
          />
        </div>

        <div className="w-full sm:w-40">
          <Button className="h-10 w-full" onClick={buscar} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Buscar
          </Button>
        </div>
      </div>

      {/* Resultados */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[58%]">Serviço</TableHead>
              <TableHead className="w-[18%]">Código</TableHead>
              <TableHead className="w-[18%] text-right">Preço base</TableHead>
              <TableHead className="w-[6%] text-center">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resultados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  Nenhum serviço encontrado.
                </TableCell>
              </TableRow>
            ) : (
              resultados.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="pr-4">{s.descricao}</TableCell>
                  <TableCell>{s.codigo}</TableCell>
                  <TableCell className="tabular-nums text-right">{money(s.precohora)}</TableCell>
                  <TableCell className="text-center">
                    <Button size="icon" variant="outline" title="Adicionar" onClick={() => onAdicionar(s)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
            )))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
