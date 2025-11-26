// src/app/(app)/(pages)/configuracoes/tipos/components/contas-bancarias-section.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  ChevronsLeft,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronsRight,
  Loader as LoaderIcon,
  Loader2,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ativo: boolean;
};

const TIPO_OPTIONS = ["CORRENTE", "POUPANCA", "CAIXA"];

const emptyForm: ContaForm = {
  titulo: "",
  valorinicial: "",
  agencia: "",
  contanumero: "",
  tipo: "CORRENTE",
  proprietario: "",
  ativo: true,
};

export default function ContasBancariasSection() {
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<ContaBancaria | null>(null);
  const [form, setForm] = useState<ContaForm>(emptyForm);

  // paginação
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const total = contas.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const start = (page - 1) * limit;
  const end = Math.min(total, start + limit);
  const pageItems = useMemo(
    () => contas.slice(start, end),
    [contas, start, end]
  );

  const linhasSkeleton = useMemo(
    () =>
      Array.from({ length: Math.min(5, limit) }).map((_, i) => (
        <TableRow key={`skeleton-${i}`} className="animate-pulse">
          <TableCell className="h-10">
            <div className="h-3 w-44 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-20 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-32 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-28 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-20 bg-muted rounded" />
          </TableCell>
          <TableCell className="text-center">
            <div className="h-5 w-16 bg-muted rounded-full mx-auto" />
          </TableCell>
          <TableCell className="text-right">
            <div className="h-6 w-10 bg-muted rounded-full ml-auto" />
          </TableCell>
        </TableRow>
      )),
    [limit]
  );

  async function loadContas() {
    try {
      setIsLoading(true);
      setErro(null);
      const res = await fetch("/api/tipos/bancos", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json?.error || "Erro ao carregar contas bancárias");

      const items: ContaBancaria[] = (json.items ?? json.data ?? []).map(
        (c: ContaBancaria) => ({
          ...c,
          ativo: c.ativo ?? true,
        })
      );
      setContas(items);
    } catch (err: any) {
      console.error(err);
      setErro(err?.message || "Erro ao carregar contas bancárias");
      toast.error(err?.message || "Erro ao carregar contas bancárias");
      setContas([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadContas();
  }, []);

  function handleChange<K extends keyof ContaForm>(key: K, value: ContaForm[K]) {
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
      valorinicial:
        c.valorinicial != null ? String(c.valorinicial) : "",
      agencia: c.agencia ?? "",
      contanumero: c.contanumero ?? "",
      tipo: c.tipo ?? "CORRENTE",
      proprietario: c.proprietario ?? "",
      ativo: c.ativo ?? true,
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
      ativo: form.ativo,
    };

    try {
      setIsSaving(true);

      if (editing) {
        const res = await fetch(`/api/tipos/bancos/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok)
          throw new Error(
            json?.error || "Erro ao atualizar conta bancária"
          );
        toast.success("Conta atualizada com sucesso");
      } else {
        const res = await fetch("/api/tipos/bancos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok)
          throw new Error(
            json?.error || "Erro ao salvar conta bancária"
          );
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

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho no padrão das outras seções */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Contas bancárias
          </h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <span className="text-foreground/60">
              {total} conta{total === 1 ? "" : "s"} bancária
              {total === 1 ? "" : "s"}
            </span>
            {erro && (
              <Badge variant="destructive" className="ml-1">
                {erro}
              </Badge>
            )}
            <button
              onClick={loadContas}
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

        {/* Dialog Nova/Editar conta */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              onClick={openNovo}
              className="hover:cursor-pointer"
            >
              <Plus className="mr-1 h-4 w-4" />
              Nova conta
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar conta bancária" : "Nova conta bancária"}
              </DialogTitle>
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
                    onChange={(e) =>
                      handleChange("tipo", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleChange("valorinicial", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Agência (opcional)</Label>
                  <Input
                    value={form.agencia}
                    onChange={(e) =>
                      handleChange("agencia", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Conta (opcional)</Label>
                  <Input
                    value={form.contanumero}
                    onChange={(e) =>
                      handleChange("contanumero", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Proprietário (opcional)</Label>
                <Input
                  value={form.proprietario}
                  onChange={(e) =>
                    handleChange("proprietario", e.target.value)
                  }
                  placeholder="Nome de quem aparece na conta"
                />
              </div>

              {/* Status dentro do diálogo */}
              <div className="mt-4 flex items-center justify-between rounded-md border px-3 py-2 bg-muted/40">
                <div className="space-y-0.5">
                  <Label>Status da conta</Label>
                  <p className="text-xs text-muted-foreground">
                    Defina se esta conta está disponível para lançamentos
                    financeiros.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {form.ativo ? "Ativa" : "Inativa"}
                  </span>
                  <Switch
                    checked={form.ativo}
                    onCheckedChange={(val) => handleChange("ativo", val)}
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
              <Button type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela no padrão das outras páginas (sem Card) */}
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
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Agência / Conta</TableHead>
              <TableHead>Proprietário</TableHead>
              <TableHead>Valor inicial</TableHead>
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
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhuma conta bancária cadastrada. Clique em{" "}
                  <b>Nova conta</b> para cadastrar.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((c) => (
                <TableRow key={c.id} className="hover:cursor-default">
                  <TableCell className="font-medium">{c.titulo}</TableCell>
                  <TableCell>{c.tipo}</TableCell>
                  <TableCell className="text-sm">
                    {c.agencia || "—"}
                    {c.contanumero && ` / ${c.contanumero}`}
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.proprietario || "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    R$ {Number(c.valorinicial ?? 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={c.ativo ? "default" : "outline"}
                      className={
                        c.ativo ? "" : "border-destructive bg-destructive"
                      }
                    >
                      {c.ativo ? "Ativa" : "Inativa"}
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
                        <DropdownMenuItem onClick={() => openEditar(c)}>
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

        {/* Paginação no rodapé */}
        <div className="flex items-center mt-4 justify-between">
          <div className="text-xs text-muted-foreground flex flex-nowrap">
            {total > 0 ? (
              <>
                <span>{start + 1}</span>&nbsp;-&nbsp;<span>{end}</span>
                <span className="ml-1 hidden sm:block">de {total}</span>
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
                const n = parseInt(v, 10) || 20;
                setLimit(n);
                setPage(1);
              }}
            >
              <SelectTrigger
                size="sm"
                className="hover:cursor-pointer ml-2 w-[80px]"
              >
                <SelectValue placeholder={limit} />
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
