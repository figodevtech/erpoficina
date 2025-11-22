"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

type ContaBancaria = {
  id: number;
  titulo: string;
  valorinicial: number;
  agencia: string | null;
  contanumero: string | null;
  tipo: string;
  proprietario: string | null;
  ativo: boolean | null;
};

type ContaForm = {
  titulo: string;
  valorinicial: string;
  agencia: string;
  contanumero: string;
  tipo: string;
  proprietario: string;
};

const TIPO_OPTIONS = ["CORRENTE", "POUPANCA", "CAIXA"];

const emptyForm: ContaForm = {
  titulo: "",
  valorinicial: "",
  agencia: "",
  contanumero: "",
  tipo: "CORRENTE",
  proprietario: "",
};

export default function ContasBancariasSection() {
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<ContaBancaria | null>(null);
  const [form, setForm] = useState<ContaForm>(emptyForm);
  const [toggleLoadingId, setToggleLoadingId] = useState<number | null>(null);

  async function loadContas() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/tipos/bancos", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erro ao carregar contas bancárias");

      const items: ContaBancaria[] = (json.items ?? json.data ?? []).map((c: ContaBancaria) => ({
        ...c,
        ativo: c.ativo ?? true,
      }));
      setContas(items);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao carregar contas bancárias");
      setContas([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadContas();
  }, []);

  function handleChange<K extends keyof ContaForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openNovo() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditar(c: ContaBancaria) {
    setEditing(c);
    setForm({
      titulo: c.titulo ?? "",
      valorinicial: c.valorinicial != null ? String(c.valorinicial) : "",
      agencia: c.agencia ?? "",
      contanumero: c.contanumero ?? "",
      tipo: c.tipo ?? "CORRENTE",
      proprietario: c.proprietario ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.titulo.trim()) {
      toast.error("Informe o título da conta.");
      return;
    }
    if (!form.valorinicial.trim() || Number.isNaN(Number(form.valorinicial))) {
      toast.error("Informe um valor inicial válido.");
      return;
    }

    const payload = {
      titulo: form.titulo.trim(),
      valorinicial: Number(form.valorinicial),
      agencia: form.agencia.trim() || null,
      contanumero: form.contanumero.trim() || null,
      tipo: form.tipo.trim(),
      proprietario: form.proprietario.trim() || null,
    };

    try {
      setIsSaving(true);

      if (editing) {
        // atualizar
        const res = await fetch(`/api/tipos/bancos/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Erro ao atualizar conta bancária");
        toast.success("Conta atualizada com sucesso");
      } else {
        // criar
        const res = await fetch("/api/tipos/bancos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Erro ao salvar conta bancária");
        toast.success("Conta cadastrada com sucesso");
      }

      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await loadContas();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao salvar conta bancária");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleAtivo(id: number, ativo: boolean) {
    try {
      setToggleLoadingId(id);

      // otimista
      setContas((old) => old.map((item) => (item.id === id ? { ...item, ativo } : item)));

      const res = await fetch(`/api/tipos/bancos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erro ao atualizar status da conta");

      setContas((old) =>
        old.map((item) => (item.id === id ? { ...item, ativo: json.item?.ativo ?? ativo } : item))
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao alterar status da conta");
      setContas((old) => old.map((item) => (item.id === id ? { ...item, ativo: !ativo } : item)));
    } finally {
      setToggleLoadingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full min-h-[460px]">
      {/* Cabeçalho + botão Nova conta (abre dialog) */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Contas bancárias</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastre as contas onde serão registradas as movimentações financeiras.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openNovo}>
              <Plus className="mr-1 h-4 w-4" />
              Nova conta
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar conta bancária" : "Nova conta bancária"}</DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Título da conta</Label>
                <Input
                  value={form.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                  placeholder="Ex.: Caixa principal, Banco X - Conta corrente"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.tipo}
                    onChange={(e) => handleChange("tipo", e.target.value)}
                  >
                    {TIPO_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Valor inicial (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.valorinicial}
                    onChange={(e) => handleChange("valorinicial", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Agência (opcional)</Label>
                  <Input
                    value={form.agencia}
                    onChange={(e) => handleChange("agencia", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Conta (opcional)</Label>
                  <Input
                    value={form.contanumero}
                    onChange={(e) => handleChange("contanumero", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Proprietário (opcional)</Label>
                <Input
                  value={form.proprietario}
                  onChange={(e) => handleChange("proprietario", e.target.value)}
                  placeholder="Nome de quem aparece na conta"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setDialogOpen(false);
                  setEditing(null);
                  setForm(emptyForm);
                }}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de contas */}
      <div className="rounded-md border bg-background overflow-hidden min-h-[220px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Agência / Conta</TableHead>
              <TableHead>Proprietário</TableHead>
              <TableHead>Valor inicial</TableHead>
              <TableHead className="w-[120px] text-center">Status</TableHead>
              <TableHead className="w-[120px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                  Carregando contas bancárias...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && contas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                  Nenhuma conta bancária cadastrada.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              contas.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => openEditar(c)}
                >
                  <TableCell className="font-medium">{c.titulo}</TableCell>
                  <TableCell>{c.tipo}</TableCell>
                  <TableCell className="text-sm">
                    {c.agencia || "—"} {c.contanumero && ` / ${c.contanumero}`}
                  </TableCell>
                  <TableCell className="text-sm">{c.proprietario || "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    R$ {Number(c.valorinicial ?? 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    <Badge
                      variant={c.ativo ? "default" : "outline"}
                      className={c.ativo ? "" : "border-destructive text-destructive"}
                    >
                      {c.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        Ativo
                      </span>
                      <Switch
                        checked={Boolean(c.ativo)}
                        disabled={toggleLoadingId === c.id}
                        onCheckedChange={(val) => handleToggleAtivo(c.id, val)}
                      />
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
