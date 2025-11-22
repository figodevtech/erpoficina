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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

type Fornecedor = {
  id: number;
  cnpj: string;
  razaosocial: string;
  nomefantasia: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  contato: string | null;
  ativo: boolean | null;
};

type FornecedorForm = {
  cnpj: string;
  razaosocial: string;
  nomefantasia: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  contato: string;
};

const emptyForm: FornecedorForm = {
  cnpj: "",
  razaosocial: "",
  nomefantasia: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  contato: "",
};

export default function FornecedoresSection() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<Fornecedor | null>(null);
  const [form, setForm] = useState<FornecedorForm>(emptyForm);
  const [toggleLoadingId, setToggleLoadingId] = useState<number | null>(null);

  async function loadFornecedores() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/tipos/fornecedores", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erro ao carregar fornecedores");

      const items: Fornecedor[] = (json.items ?? json.data ?? []).map((f: Fornecedor) => ({
        ...f,
        ativo: f.ativo ?? true,
      }));
      setFornecedores(items);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao carregar fornecedores");
      setFornecedores([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFornecedores();
  }, []);

  function handleChange<K extends keyof FornecedorForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openNovo() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditar(f: Fornecedor) {
    setEditing(f);
    setForm({
      cnpj: f.cnpj ?? "",
      razaosocial: f.razaosocial ?? "",
      nomefantasia: f.nomefantasia ?? "",
      endereco: f.endereco ?? "",
      cidade: f.cidade ?? "",
      estado: f.estado ?? "",
      cep: f.cep ?? "",
      contato: f.contato ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.cnpj.trim() || !form.razaosocial.trim()) {
      toast.error("CNPJ e Razão Social são obrigatórios.");
      return;
    }

    const payload = {
      cnpj: form.cnpj.trim(),
      razaosocial: form.razaosocial.trim(),
      nomefantasia: form.nomefantasia.trim() || null,
      endereco: form.endereco.trim() || null,
      cidade: form.cidade.trim() || null,
      estado: form.estado.trim() || null,
      cep: form.cep.trim() || null,
      contato: form.contato.trim() || null,
    };

    try {
      setIsSaving(true);

      if (editing) {
        const res = await fetch(`/api/tipos/fornecedores/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Falha ao atualizar fornecedor");
        toast.success("Fornecedor atualizado");
      } else {
        const res = await fetch("/api/tipos/fornecedores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Falha ao cadastrar fornecedor");
        toast.success("Fornecedor cadastrado");
      }

      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await loadFornecedores();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao salvar fornecedor");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleAtivo(id: number, ativo: boolean) {
    try {
      setToggleLoadingId(id);

      // update otimista
      setFornecedores((old) =>
        old.map((item) => (item.id === id ? { ...item, ativo } : item))
      );

      const res = await fetch(`/api/tipos/fornecedores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erro ao atualizar status");

      setFornecedores((old) =>
        old.map((item) =>
          item.id === id ? { ...item, ativo: json.item?.ativo ?? ativo } : item
        )
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao alterar status");
      setFornecedores((old) =>
        old.map((item) =>
          item.id === id ? { ...item, ativo: !ativo } : item
        )
      );
    } finally {
      setToggleLoadingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full min-h-[460px]">
      {/* Cabeçalho + botão Novo fornecedor (abre dialog) */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Fornecedores</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastre fornecedores para vincular nas compras e produtos.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openNovo}>
              <Plus className="mr-1 h-4 w-4" />
              Novo fornecedor
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar fornecedor" : "Novo fornecedor"}</DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
                <div className="space-y-1.5">
                  <Label>CNPJ</Label>
                  <Input
                    value={form.cnpj}
                    onChange={(e) => handleChange("cnpj", e.target.value)}
                    placeholder="Somente números"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Razão Social</Label>
                  <Input
                    value={form.razaosocial}
                    onChange={(e) => handleChange("razaosocial", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Nome Fantasia (opcional)</Label>
                <Input
                  value={form.nomefantasia}
                  onChange={(e) => handleChange("nomefantasia", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Endereço</Label>
                <Input
                  value={form.endereco}
                  onChange={(e) => handleChange("endereco", e.target.value)}
                  placeholder="Rua, número, bairro..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.3fr)]">
                <div className="space-y-1.5">
                  <Label>Cidade</Label>
                  <Input
                    value={form.cidade}
                    onChange={(e) => handleChange("cidade", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Estado</Label>
                  <Input
                    value={form.estado}
                    onChange={(e) => handleChange("estado", e.target.value)}
                    placeholder="UF"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>CEP</Label>
                  <Input
                    value={form.cep}
                    onChange={(e) => handleChange("cep", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Contato (telefone/email)</Label>
                <Input
                  value={form.contato}
                  onChange={(e) => handleChange("contato", e.target.value)}
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

      {/* Tabela de fornecedores */}
      <div className="rounded-md border bg-background overflow-hidden min-h-[220px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razão Social</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Cidade / UF</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="w-[120px] text-center">Status</TableHead>
              <TableHead className="w-[120px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                  Carregando fornecedores...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && fornecedores.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum fornecedor cadastrado ainda.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              fornecedores.map((f) => (
                <TableRow
                  key={f.id}
                  className="cursor-pointer"
                  onClick={() => openEditar(f)}
                >
                  <TableCell className="font-medium">
                    {f.razaosocial}
                    {f.nomefantasia && (
                      <div className="text-[11px] text-muted-foreground">
                        Fantasia: {f.nomefantasia}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{f.cnpj}</TableCell>
                  <TableCell className="text-sm">
                    {f.cidade || "—"}
                    {f.estado && ` / ${f.estado}`}
                  </TableCell>
                  <TableCell className="text-sm">{f.contato || "—"}</TableCell>
                  <TableCell
                    className="text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Badge
                      variant={f.ativo ? "default" : "outline"}
                      className={f.ativo ? "" : "border-destructive text-destructive"}
                    >
                      {f.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        Ativo
                      </span>
                      <Switch
                        checked={Boolean(f.ativo)}
                        disabled={toggleLoadingId === f.id}
                        onCheckedChange={(val) => handleToggleAtivo(f.id, val)}
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
