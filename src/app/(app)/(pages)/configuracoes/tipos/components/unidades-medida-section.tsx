// src/app/(app)/(pages)/configuracoes/tipos/components/unidades-medida-section.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, MoreHorizontal } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UnidadeMedida = {
  id: number;
  sigla: string; // UN, JGO, KIT, PAR...
  descricao: string | null;
  ativo: boolean | null;
};

type UnidadeForm = {
  sigla: string;
  descricao: string;
  ativo: boolean;
};

const emptyEditForm: UnidadeForm = {
  sigla: "",
  descricao: "",
  ativo: true,
};

export default function UnidadesMedidaSection() {
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // form rápido de criação
  const [sigla, setSigla] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isSavingCreate, setIsSavingCreate] = useState(false);

  // dialog de edição
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UnidadeMedida | null>(null);
  const [editForm, setEditForm] = useState<UnidadeForm>(emptyEditForm);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const total = unidades.length;

  async function loadUnidades() {
    try {
      setIsLoading(true);
      setErro(null);
      const res = await fetch("/api/tipos/unidades-medida", { cache: "no-store" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Falha ao carregar unidades de medida");

      const items: UnidadeMedida[] = (j.items ?? j.data ?? []).map((u: UnidadeMedida) => ({
        ...u,
        descricao: u.descricao ?? null,
        ativo: u.ativo ?? true,
      }));

      setUnidades(items);
    } catch (e: any) {
      console.error(e);
      setErro(e?.message || "Erro ao carregar unidades de medida");
      toast.error(e?.message || "Erro ao carregar unidades de medida");
      setUnidades([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUnidades();
  }, []);

  // ==== CRIAÇÃO RÁPIDA ====

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!sigla.trim()) {
      toast.error("Informe a sigla da unidade.");
      return;
    }

    try {
      setIsSavingCreate(true);
      const payload = {
        sigla: sigla.trim().toUpperCase(),
        descricao: descricao.trim() || null,
      };

      const res = await fetch("/api/tipos/unidades-medida", {
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
      setIsSavingCreate(false);
    }
  }

  // ==== EDIÇÃO EM DIALOG ====

  function openEditar(u: UnidadeMedida) {
    setEditing(u);
    setEditForm({
      sigla: u.sigla ?? "",
      descricao: u.descricao ?? "",
      ativo: u.ativo ?? true,
    });
    setDialogOpen(true);
  }

  function handleEditChange<K extends keyof UnidadeForm>(key: K, value: UnidadeForm[K]) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveEdit() {
    if (!editing) return;

    if (!editForm.sigla.trim()) {
      toast.error("Sigla é obrigatória.");
      return;
    }

    const payload = {
      sigla: editForm.sigla.trim().toUpperCase(),
      descricao: editForm.descricao.trim() || null,
      ativo: editForm.ativo,
    };

    try {
      setIsSavingEdit(true);

      const res = await fetch(`/api/tipos/unidades-medida/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Falha ao atualizar unidade de medida");

      toast.success("Unidade de medida atualizada.");

      setDialogOpen(false);
      setEditing(null);
      setEditForm(emptyEditForm);
      await loadUnidades();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao atualizar unidade de medida");
    } finally {
      setIsSavingEdit(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header no padrão dos outros tipos */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Unidades de medida</h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <span className="text-foreground/60">
              {total} unidade{total === 1 ? "" : "s"} cadastrada{total === 1 ? "" : "s"}
            </span>
            {erro && (
              <Badge variant="destructive" className="ml-1">
                {erro}
              </Badge>
            )}
            <button
              onClick={loadUnidades}
              className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground/70 ml-2 text-xs"
            >
              <span>Recarregar</span>
              <Loader2 width={12} className={isLoading ? "animate-spin" : ""} />
            </button>
          </p>
        </div>
      </div>

      {/* Form de cadastro rápido (novo) */}
      <div className="rounded-md border bg-background p-4 space-y-3">
        <form
          onSubmit={handleCreate}
          className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(0,1fr)] items-end"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium">Sigla</label>
            <Input
              value={sigla}
              onChange={(e) => setSigla(e.target.value)}
              placeholder="UN, JGO, KIT..."
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
            <Button type="submit" disabled={isSavingCreate}>
              {isSavingCreate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Plus className="mr-1 h-4 w-4" />
              Adicionar medida
            </Button>
          </div>
        </form>
      </div>

      {/* Dialog de edição */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditing(null);
            setEditForm(emptyEditForm);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar unidade de medida" : "Unidade de medida"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Sigla</label>
              <Input
                value={editForm.sigla}
                onChange={(e) => handleEditChange("sigla", e.target.value)}
                placeholder="UN, JGO, KIT..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={editForm.descricao}
                onChange={(e) => handleEditChange("descricao", e.target.value)}
                placeholder="Descrição amigável para relatórios"
              />
            </div>

            <div className="mt-4 flex items-center justify-between rounded-md border px-3 py-2 bg-muted/40">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">Status da unidade</span>
                <p className="text-xs text-muted-foreground">
                  Defina se esta unidade pode ser utilizada nos cadastros de produtos.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {editForm.ativo ? "Ativo" : "Inativo"}
                </span>
                <Switch
                  checked={editForm.ativo}
                  onCheckedChange={(val) => handleEditChange("ativo", val)}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setDialogOpen(false);
                setEditing(null);
                setEditForm(emptyEditForm);
              }}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveEdit} disabled={isSavingEdit || !editing}>
              {isSavingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabela de unidades – sem onClick na row; ações com dropdown */}
      <div className="rounded-md border bg-background px-4 pb-4 pt-0 relative min-h-[190px]">
        {/* Barrinha de loading no topo */}
        <div
          className={`${
            isLoading ? "opacity-100" : ""
          } transition-all opacity-0 h-0.5 bg-slate-400 w-full overflow-hidden absolute left-0 right-0 top-0`}
        >
          <div
            className={`w-1/2 bg-primary h-full absolute left-0 rounded-lg -translate-x-[100%] ${
              isLoading ? "animate-slideIn" : ""
            }`}
          />
        </div>

        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Sigla</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  Carregando unidades de medida...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && unidades.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  Nenhuma unidade cadastrada.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              unidades.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono">{u.sigla}</TableCell>
                  <TableCell>{u.descricao || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={u.ativo ? "default" : "outline"}
                      className={u.ativo ? "" : "border-destructive bg-destructive"}
                    >
                      {u.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => openEditar(u)}>
                          Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
