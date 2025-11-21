// src/app/(app)/(pages)/configuracoes/tipos/components/servicos-section.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

type Servico = {
  id: number;
  codigo: string;
  descricao: string;
  precohora: number;
  codigoservicomunicipal: string;
  aliquotaiss?: number | null;
  cnae?: string | null;
  itemlistaservico: string;
  tiposervicoid?: number | null;
  ativo?: boolean;
};

type ServicoForm = {
  codigo: string;
  descricao: string;
  precohora: string;
  codigoservicomunicipal: string;
  aliquotaiss: string;
  cnae: string;
  itemlistaservico: string;
  tiposervicoid: string;
};

const emptyForm: ServicoForm = {
  codigo: "",
  descricao: "",
  precohora: "",
  codigoservicomunicipal: "",
  aliquotaiss: "",
  cnae: "",
  itemlistaservico: "",
  tiposervicoid: "",
};

export default function ServicosSection() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<Servico | null>(null);
  const [form, setForm] = useState<ServicoForm>(emptyForm);

  async function loadServicos() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/config/servicos", { cache: "no-store" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Falha ao carregar serviços");
      setServicos(j.items ?? j.data ?? []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao carregar serviços");
      setServicos([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadServicos();
  }, []);

  function openNovo() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditar(s: Servico) {
    setEditing(s);
    setForm({
      codigo: s.codigo ?? "",
      descricao: s.descricao ?? "",
      precohora: s.precohora != null ? String(s.precohora) : "",
      codigoservicomunicipal: s.codigoservicomunicipal ?? "",
      aliquotaiss: s.aliquotaiss != null ? String(s.aliquotaiss) : "",
      cnae: s.cnae ?? "",
      itemlistaservico: s.itemlistaservico ?? "",
      tiposervicoid: s.tiposervicoid != null ? String(s.tiposervicoid) : "",
    });
    setDialogOpen(true);
  }

  function handleChange<K extends keyof ServicoForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.codigo.trim() || !form.descricao.trim()) {
      toast.error("Código e descrição são obrigatórios.");
      return;
    }
    if (!form.precohora.trim() || Number.isNaN(Number(form.precohora))) {
      toast.error("Preço/hora inválido.");
      return;
    }
    if (!form.codigoservicomunicipal.trim()) {
      toast.error("Código de serviço municipal é obrigatório.");
      return;
    }
    if (!form.itemlistaservico.trim()) {
      toast.error("Item da lista de serviço é obrigatório.");
      return;
    }

    const payload = {
      codigo: form.codigo.trim(),
      descricao: form.descricao.trim(),
      precohora: Number(form.precohora),
      codigoservicomunicipal: form.codigoservicomunicipal.trim(),
      aliquotaiss: form.aliquotaiss.trim() ? Number(form.aliquotaiss) : null,
      cnae: form.cnae.trim() || null,
      itemlistaservico: form.itemlistaservico.trim(),
      tiposervicoid: form.tiposervicoid.trim() ? Number(form.tiposervicoid) : null,
    };

    try {
      setIsSaving(true);
      if (editing) {
        const res = await fetch(`/api/config/servicos/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || "Falha ao atualizar serviço");
        toast.success("Serviço atualizado");
      } else {
        const res = await fetch("/api/config/servicos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || "Falha ao cadastrar serviço");
        toast.success("Serviço cadastrado");
      }

      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await loadServicos();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao salvar serviço");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleAtivo(id: number, ativo: boolean) {
    try {
      const res = await fetch(`/api/config/servicos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Falha ao atualizar serviço");

      setServicos((old) => old.map((s) => (s.id === id ? { ...s, ativo } : s)));
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao atualizar serviço");
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full min-h-[460px]">
      {/* Cabeçalho + botão Novo serviço (abre dialog) */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Serviços</h2>
          <p className="text-sm text-muted-foreground">Cadastre os serviços de mão de obra e diagnósticos.</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNovo}>
              <Plus className="mr-1 h-4 w-4" />
              Novo serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar serviço" : "Novo serviço"}</DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              {/* Linha 1: Código + Descrição */}
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Código</label>
                  <Input
                    value={form.codigo}
                    onChange={(e) => handleChange("codigo", e.target.value)}
                    placeholder="Ex.: ALINH001"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Descrição</label>
                  <Input
                    value={form.descricao}
                    onChange={(e) => handleChange("descricao", e.target.value)}
                    placeholder="Ex.: Alinhamento e balanceamento"
                  />
                </div>
              </div>

              {/* Linha 2: Preço/hora + Cód. Serv. Municipal */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Preço/hora</label>
                  <Input
                    value={form.precohora}
                    onChange={(e) => handleChange("precohora", e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Código serviço municipal</label>
                  <Input
                    value={form.codigoservicomunicipal}
                    onChange={(e) => handleChange("codigoservicomunicipal", e.target.value)}
                    placeholder="Código conforme prefeitura"
                  />
                </div>
              </div>

              {/* Linha 3: Aliquota ISS + CNAE */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Alíquota ISS (%)</label>
                  <Input
                    value={form.aliquotaiss}
                    onChange={(e) => handleChange("aliquotaiss", e.target.value)}
                    placeholder="Ex.: 5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">CNAE</label>
                  <Input
                    value={form.cnae}
                    onChange={(e) => handleChange("cnae", e.target.value)}
                    placeholder="CNAE do serviço (opcional)"
                  />
                </div>
              </div>

              {/* Linha 4: Item lista serviço + Tipo de serviço (id) */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Item da lista de serviço</label>
                  <Input
                    value={form.itemlistaservico}
                    onChange={(e) => handleChange("itemlistaservico", e.target.value)}
                    placeholder="Ex.: 14.01"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tipo de serviço (ID)</label>
                  <Input
                    value={form.tiposervicoid}
                    onChange={(e) => handleChange("tiposervicoid", e.target.value)}
                    placeholder="ID da categoria do serviço (opcional)"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setEditing(null);
                  setForm(emptyForm);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de serviços */}
      <div className="rounded-md border bg-background overflow-hidden min-h-[220px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Preço/hora</TableHead>
              <TableHead>Item lista</TableHead>
              <TableHead>Cód. mun.</TableHead>
              <TableHead className="w-[120px]">Ativo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                  Carregando serviços...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && servicos.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum serviço cadastrado.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              servicos.map((s) => (
                <TableRow key={s.id} className="cursor-pointer" onClick={() => openEditar(s)}>
                  <TableCell className="font-mono">{s.codigo}</TableCell>
                  <TableCell>{s.descricao}</TableCell>
                  <TableCell>{s.precohora != null ? s.precohora.toFixed(2) : "—"}</TableCell>
                  <TableCell>{s.itemlistaservico}</TableCell>
                  <TableCell>{s.codigoservicomunicipal}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Switch checked={s.ativo ?? true} onCheckedChange={(val) => handleToggleAtivo(s.id, val)} />
                      <span className="text-xs text-muted-foreground">{s.ativo ? "Ativo" : "Inativo"}</span>
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
