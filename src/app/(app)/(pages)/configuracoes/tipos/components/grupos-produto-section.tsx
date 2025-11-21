// src/app/(app)/(pages)/configuracoes/tipos/components/grupos-produto-section.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type GrupoProduto = {
  id: number;
  nome: string;
  descricao?: string | null;
  ativo?: boolean;
};

export default function GruposProdutoSection() {
  const [grupos, setGrupos] = useState<GrupoProduto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function loadGrupos() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/config/grupos-produto", { cache: "no-store" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Falha ao carregar grupos de produto");
      setGrupos(j.items ?? j.data ?? []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao carregar grupos de produto");
      setGrupos([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadGrupos();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Informe um nome para o grupo.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        nome: nome.trim(),
        descricao: descricao.trim() || null,
      };

      const res = await fetch("/api/config/grupos-produto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Falha ao cadastrar grupo de produto");

      toast.success("Grupo de produto cadastrado.");
      setNome("");
      setDescricao("");
      await loadGrupos();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao salvar grupo de produto");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleAtivo(id: number, ativo: boolean) {
    try {
      const res = await fetch(`/api/config/grupos-produto/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Falha ao atualizar grupo");

      setGrupos((old) => old.map((g) => (g.id === id ? { ...g, ativo } : g)));
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao atualizar grupo");
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full min-h-[460px]">
      {/* Header + form simples */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Grupos de produtos</h2>
          <p className="text-sm text-muted-foreground">Organize os produtos por área / sistema do veículo.</p>
        </div>
      </div>

      <div className="rounded-md border bg-background p-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(0,1fr)] items-end">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nome do grupo</label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: MOTOR, FREIOS, SUSPENSÃO..."
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
              Adicionar grupo
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela de grupos (sempre renderizada) */}
      <div className="rounded-md border bg-background overflow-hidden min-h-[220px]">
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
                <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                  Carregando grupos de produto...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && grupos.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum grupo cadastrado.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              grupos.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.nome}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{g.descricao || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={g.ativo ?? true} onCheckedChange={(val) => handleToggleAtivo(g.id, val)} />
                      <span className="text-xs text-muted-foreground">{g.ativo ? "Ativo" : "Inativo"}</span>
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
