// src/app/(app)/(pages)/configuracoes/tipos/components/unidades-medida-section.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type UnidadeMedida = {
  id: number;
  sigla: string; // UN, JGO, KIT, PAR...
  descricao?: string | null;
  ativo?: boolean;
};

export default function UnidadesMedidaSection() {
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [sigla, setSigla] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function loadUnidades() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/config/unidades-medida", { cache: "no-store" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Falha ao carregar unidades de medida");
      setUnidades(j.items ?? j.data ?? []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao carregar unidades de medida");
      setUnidades([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUnidades();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!sigla.trim()) {
      toast.error("Informe a sigla da unidade.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        sigla: sigla.trim().toUpperCase(),
        descricao: descricao.trim() || null,
      };

      const res = await fetch("/api/config/unidades-medida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Falha ao cadastrar unidade de medida");

      toast.success("Unidade de medida cadastrada.");
      setSigla("");
      setDescricao("");
      await loadUnidades();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao salvar unidade de medida");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleAtivo(id: number, ativo: boolean) {
    try {
      const res = await fetch(`/api/config/unidades-medida/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Falha ao atualizar unidade");

      setUnidades((old) => old.map((u) => (u.id === id ? { ...u, ativo } : u)));
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao atualizar unidade");
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full min-h-[460px]">
      {/* Header + form */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Unidades de medida</h2>
          <p className="text-sm text-muted-foreground">Cadastre siglas como UN, JGO, KIT, PAR, CX, PCT...</p>
        </div>
      </div>

      <div className="rounded-md border bg-background p-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(0,1fr)] items-end">
          <div className="space-y-1">
            <label className="text-sm font-medium">Sigla</label>
            <Input value={sigla} onChange={(e) => setSigla(e.target.value)} placeholder="UN, JGO, KIT..." />
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
              Adicionar medida
            </Button>
          </div>
        </div>
      </div>
      {/* Tabela de unidades */}
      <div className="rounded-md border bg-background overflow-hidden min-h-[220px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sigla</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[120px]">Ativo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                  Carregando unidades de medida...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && unidades.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                  Nenhuma unidade cadastrada.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              unidades.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono">{u.sigla}</TableCell>
                  <TableCell>{u.descricao || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={u.ativo ?? true} onCheckedChange={(val) => handleToggleAtivo(u.id, val)} />
                      <span className="text-xs text-muted-foreground">{u.ativo ? "Ativo" : "Inativo"}</span>
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
