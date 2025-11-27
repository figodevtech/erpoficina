// src/app/(app)/(pages)/configuracoes/tipos/components/unidades-medida-section.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  MoreHorizontal,
  ChevronsLeft,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronsRight,
  Loader as LoaderIcon,
} from "lucide-react";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const emptyForm: UnidadeForm = {
  sigla: "",
  descricao: "",
  ativo: true,
};

const DEFAULT_LIMIT = 10;

export default function UnidadesMedidaSection() {
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // dialog + form (criar/editar)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UnidadeMedida | null>(null);
  const [form, setForm] = useState<UnidadeForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  // paginação local
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const total = unidades.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const start = (page - 1) * limit;
  const end = Math.min(total, start + limit);

  const pageItems = useMemo(
    () => unidades.slice(start, end),
    [unidades, start, end]
  );

  const linhasSkeleton = useMemo(
    () =>
      Array.from({ length: Math.min(5, limit) }).map((_, i) => (
        <TableRow key={`skeleton-${i}`} className="animate-pulse">
          <TableCell className="h-10">
            <div className="h-3 w-16 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-40 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-16 bg-muted rounded-full mx-auto" />
          </TableCell>
          <TableCell className="text-right">
            <div className="h-6 w-10 bg-muted rounded-full ml-auto" />
          </TableCell>
        </TableRow>
      )),
    [limit]
  );

  async function loadUnidades() {
    try {
      setIsLoading(true);
      setErro(null);
      const res = await fetch("/api/tipos/unidades-medida", {
        cache: "no-store",
      });
      const j = await res.json();
      if (!res.ok)
        throw new Error(j?.error || "Falha ao carregar unidades de medida");

      const items: UnidadeMedida[] = (j.items ?? j.data ?? []).map(
        (u: UnidadeMedida) => ({
          ...u,
          descricao: u.descricao ?? null,
          ativo: u.ativo ?? true,
        })
      );

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

  function handleChange<K extends keyof UnidadeForm>(
    key: K,
    value: UnidadeForm[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openNovo() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditar(u: UnidadeMedida) {
    setEditing(u);
    setForm({
      sigla: u.sigla ?? "",
      descricao: u.descricao ?? "",
      ativo: u.ativo ?? true,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.sigla.trim()) {
      toast.error("Sigla é obrigatória.");
      return;
    }

    const payload = {
      sigla: form.sigla.trim().toUpperCase(),
      descricao: form.descricao.trim() || null,
      ativo: form.ativo,
    };

    try {
      setIsSaving(true);

      if (editing) {
        // update
        const res = await fetch(`/api/tipos/unidades-medida/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const j = await res.json();
        if (!res.ok)
          throw new Error(
            j?.error || "Falha ao atualizar unidade de medida"
          );
        toast.success("Unidade de medida atualizada.");
      } else {
        // create
        const res = await fetch("/api/tipos/unidades-medida", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const j = await res.json();
        if (!res.ok)
          throw new Error(
            j?.error || "Falha ao cadastrar unidade de medida"
          );
        toast.success("Unidade de medida cadastrada.");
      }

      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await loadUnidades();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao salvar unidade de medida");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header no padrão dos outros tipos */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Unidades de medida
          </h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <span className="text-foreground/60">
              {total} unidade{total === 1 ? "" : "s"} cadastrada
              {total === 1 ? "" : "s"}
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
              <Loader2
                width={12}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
          </p>
        </div>

        {/* Botão + Dialog Nova/Editar unidade */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditing(null);
              setForm(emptyForm);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="hover:cursor-pointer"
              onClick={openNovo}
            >
              <Plus className="mr-1 h-4 w-4" />
              Nova unidade
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? "Editar unidade de medida"
                  : "Nova unidade de medida"}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Sigla</label>
                <Input
                  value={form.sigla}
                  onChange={(e) =>
                    handleChange("sigla", e.target.value)
                  }
                  placeholder="UN, JGO, KIT..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  value={form.descricao}
                  onChange={(e) =>
                    handleChange("descricao", e.target.value)
                  }
                  placeholder="Descrição amigável para relatórios"
                />
              </div>

              <div className="mt-4 flex items-center justify-between rounded-md border px-3 py-2 bg-muted/40">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">
                    Status da unidade
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Defina se esta unidade pode ser utilizada nos
                    cadastros de produtos.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {form.ativo ? "Ativo" : "Inativo"}
                  </span>
                  <Switch
                    checked={form.ativo}
                    onCheckedChange={(val) =>
                      handleChange("ativo", val)
                    }
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
                  setForm(emptyForm);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de unidades com paginação padrão */}
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
            {isLoading ? (
              linhasSkeleton
            ) : total === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhuma unidade cadastrada. Clique em{" "}
                  <b>Nova unidade</b> para cadastrar.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((u) => (
                <TableRow key={u.id} className="hover:cursor-default">
                  <TableCell className="font-mono">
                    {u.sigla}
                  </TableCell>
                  <TableCell>{u.descricao || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={u.ativo ? "default" : "outline"}
                      className={
                        u.ativo ? "" : "border-destructive bg-destructive"
                      }
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
                      <DropdownMenuContent
                        align="end"
                        className="w-32"
                      >
                        <DropdownMenuItem
                          onClick={() => openEditar(u)}
                        >
                          Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Paginação no rodapé (padrão dos outros) */}
        <div className="flex items-center mt-4 justify-between">
          <div className="text-xs text-muted-foreground flex flex-nowrap">
            {total > 0 ? (
              <>
                <span>{start + 1}</span>&nbsp;-&nbsp;
                <span>{end}</span>
                <span className="ml-1 hidden sm:block">
                  de {total}
                </span>
              </>
            ) : (
              <span>0 de 0</span>
            )}
            <LoaderIcon
              className={`w-4 h-full animate-spin transition-all ml-2 opacity-0 ${
                isLoading ? "opacity-100" : ""
              }`}
            />
          </div>

          <div className="flex items-center justify-center space-x-1 sm:space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page === 1 || total === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || total === 0}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-[10px] sm:text-xs font-medium text-nowrap">
              Pg. {Math.min(page, totalPages)} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={page === totalPages || total === 0}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages || total === 0}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Select
              value={String(limit)}
              onValueChange={(v) => {
                const n = parseInt(v, 10) || DEFAULT_LIMIT;
                setLimit(n);
                setPage(1);
              }}
            >
              <SelectTrigger
                size="sm"
                className="hover:cursor-pointer ml-2 w-[80px]"
              >
                <SelectValue placeholder={DEFAULT_LIMIT} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10" className="hover:cursor-pointer">
                  10
                </SelectItem>
                <SelectItem value="20" className="hover:cursor-pointer">
                  20
                </SelectItem>
                <SelectItem value="50" className="hover:cursor-pointer">
                  50
                </SelectItem>
                <SelectItem value="100" className="hover:cursor-pointer">
                  100
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
