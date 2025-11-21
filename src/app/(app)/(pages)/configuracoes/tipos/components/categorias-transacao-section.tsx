// src/app/(app)/(pages)/configuracoes/tipos/components/categorias-transacao-section.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

type CategoriaTransacao = {
  id: number;
  nome: string; // Ex.: SERVICO, PRODUTO, TRANSPORTE_LOGISTICA, etc.
  descricao?: string | null;
  ativo?: boolean;
};

export default function CategoriasTransacaoSection() {
  const [items, setItems] = useState<CategoriaTransacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  async function loadCategorias() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/config/categorias-transacao", {
        cache: "no-store",
      });
      const j = await res.json();
      if (!res.ok)
        throw new Error(j?.error || "Falha ao carregar categorias");
      setItems(j.items ?? j.data ?? []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao carregar categorias");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCategorias();
  }, []);

  async function handleCreate() {
    if (!nome.trim()) {
      toast.error("O nome da categoria é obrigatório.");
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch("/api/config/categorias-transacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          descricao: descricao.trim() || null,
        }),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Falha ao cadastrar categoria");

      toast.success("Categoria cadastrada");
      setNome("");
      setDescricao("");
      await loadCategorias();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao cadastrar categoria");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleAtivo(id: number, ativo: boolean) {
    try {
      const res = await fetch(`/api/config/categorias-transacao/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Falha ao atualizar categoria");

      setItems((old) =>
        old.map((c) => (c.id === id ? { ...c, ativo } : c)),
      );
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao atualizar categoria");
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Categorias de transação
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure as categorias para uso no fluxo de caixa e relatórios.
          </p>
        </div>
      </div>

      {/* Form de cadastro rápido */}
      <div className="rounded-md border bg-background p-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(0,1fr)] items-end">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: SERVICO, PRODUTO, TRANSPORTE_LOGISTICA..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Descrição</label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição amigável para relatórios"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCreate} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Plus className="mr-1 h-4 w-4" />
              Adicionar categoria
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-md border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[120px]">Ativo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  Carregando categorias...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  Nenhuma categoria cadastrada.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono">{c.nome}</TableCell>
                  <TableCell>{c.descricao || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={c.ativo ?? true}
                        onCheckedChange={(val) =>
                          handleToggleAtivo(c.id, val)
                        }
                      />
                      <span className="text-xs text-muted-foreground">
                        {c.ativo ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
