"use client";

import { useCallback, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ProdutoBusca } from "../tipos";

type Props = {
  onAdicionar: (p: ProdutoBusca) => void;
  className?: string;
};

const money = (n: number | string | null | undefined) =>
  (typeof n === "number" ? n : Number(n ?? 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function BuscaProdutos({ onAdicionar, className }: Props) {
  const [q, setQ] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<ProdutoBusca[]>([]);

  const buscar = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL("/api/produtos/buscar", window.location.origin);
      if (q.trim()) url.searchParams.set("q", q.trim());
      if (codigo.trim()) url.searchParams.set("codigo", codigo.trim());
      const r = await fetch(url.toString(), { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Erro ao buscar produtos");

      const items: ProdutoBusca[] = (Array.isArray(j?.produtos) ? j.produtos : []).map((p: any) => ({
        id: Number(p.id),
        // aqui você pediu que o "código" exibido seja a referência
        codigo: String(p.referencia ?? p.codigo ?? ""),
        descricao: String(p.descricao ?? p.titulo ?? ""),
        precounitario: Number(p.precounitario ?? p.precovenda ?? 0),
        estoque: Number(p.estoque ?? 0),
      }));

      setResultados(items);
      if (items.length === 0) toast.message("Nenhum produto encontrado");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao buscar produtos");
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
          <Label>Pesquisar por descrição / título / referência / EAN</Label>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder="Ex.: filtro de óleo, 789..."
            className="h-10"
          />
        </div>

        <div className="w-full space-y-1.5 sm:w-56">
          <Label>Código</Label>
          <Input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder="Ex.: REF-000123"
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
              <TableHead className="w-[50%]">Produto</TableHead>
              <TableHead className="w-[16%]">Código</TableHead>
              <TableHead className="w-[18%] text-right">Preço</TableHead>
              <TableHead className="w-[10%] text-center">Estoque</TableHead>
              <TableHead className="w-[6%] text-center">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resultados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              resultados.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pr-4">{p.descricao}</TableCell>
                  <TableCell>{p.codigo}</TableCell>
                  <TableCell className="tabular-nums text-right">{money(p.precounitario)}</TableCell>
                  <TableCell className="text-center">{p.estoque}</TableCell>
                  <TableCell className="text-center">
                    <Button size="icon" variant="outline" title="Adicionar" onClick={() => onAdicionar(p)}>
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
