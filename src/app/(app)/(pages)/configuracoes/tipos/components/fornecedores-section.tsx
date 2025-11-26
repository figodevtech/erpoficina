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

type Fornecedor = {
  id: number;
  cpfcnpj: string;
  nomerazaosocial: string;
  nomefantasia: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  contato: string | null;
  ativo: boolean | null;
};

type FornecedorForm = {
  cpfcnpj: string;
  nomerazaosocial: string;
  nomefantasia: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  contato: string;
  ativo: boolean;
};

const emptyForm: FornecedorForm = {
  cpfcnpj: "",
  nomerazaosocial: "",
  nomefantasia: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  contato: "",
  ativo: true,
};

export default function FornecedoresSection() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<Fornecedor | null>(null);
  const [form, setForm] = useState<FornecedorForm>(emptyForm);

  // paginação (padrão TabelaUsuarios)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const total = fornecedores.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const start = (page - 1) * limit;
  const end = Math.min(total, start + limit);
  const pageItems = useMemo(
    () => fornecedores.slice(start, end),
    [fornecedores, start, end]
  );

  const linhasSkeleton = useMemo(
    () =>
      Array.from({ length: Math.min(5, limit) }).map((_, i) => (
        <TableRow key={`skeleton-${i}`} className="animate-pulse">
          <TableCell className="h-10">
            <div className="h-3 w-44 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-32 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-28 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-36 bg-muted rounded" />
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

  async function loadFornecedores() {
    try {
      setIsLoading(true);
      setErro(null);
      const res = await fetch("/api/tipos/fornecedores", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erro ao carregar fornecedores");

      const items: Fornecedor[] = (json.items ?? json.data ?? []).map(
        (f: Fornecedor) => ({
          ...f,
          ativo: f.ativo ?? true,
        })
      );
      setFornecedores(items);
    } catch (err: any) {
      console.error(err);
      setErro(err?.message || "Erro ao carregar fornecedores");
      toast.error(err?.message || "Erro ao carregar fornecedores");
      setFornecedores([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFornecedores();
  }, []);

  function handleChange<K extends keyof FornecedorForm>(key: K, value: FornecedorForm[K]) {
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
      cpfcnpj: f.cpfcnpj ?? "",
      nomerazaosocial: f.nomerazaosocial ?? "",
      nomefantasia: f.nomefantasia ?? "",
      endereco: f.endereco ?? "",
      cidade: f.cidade ?? "",
      estado: f.estado ?? "",
      cep: f.cep ?? "",
      contato: f.contato ?? "",
      ativo: f.ativo ?? true,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.cpfcnpj.trim() || !form.nomerazaosocial.trim()) {
      toast.error("CNPJ e Razão Social são obrigatórios.");
      return;
    }

    const payload = {
      cpfcnpj: form.cpfcnpj.trim(),
      nomerazaosocial: form.nomerazaosocial.trim(),
      nomefantasia: form.nomefantasia.trim() || null,
      endereco: form.endereco.trim() || null,
      cidade: form.cidade.trim() || null,
      estado: form.estado.trim() || null,
      cep: form.cep.trim() || null,
      contato: form.contato.trim() || null,
      ativo: form.ativo,
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

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho no estilo da tabela de usuários, mas sem Card */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Fornecedores</h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <span className="text-foreground/60">
              {total} fornecedor{total === 1 ? "" : "es"}
            </span>
            {erro && (
              <Badge variant="destructive" className="ml-1">
                {erro}
              </Badge>
            )}
            <button
              onClick={loadFornecedores}
              className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground/70 ml-2 text-xs"
            >
              <span>Recarregar</span>
              <Loader2 width={12} className={isLoading ? "animate-spin" : ""} />
            </button>
          </p>
        </div>

        {/* Botão Novo fornecedor + Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="hover:cursor-pointer" onClick={openNovo}>
              <Plus className="mr-1 h-4 w-4" />
              Novo fornecedor
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar fornecedor" : "Novo fornecedor"}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
                <div className="space-y-1.5">
                  <Label>CNPJ</Label>
                  <Input
                    value={form.cpfcnpj}
                    onChange={(e) => handleChange("cpfcnpj", e.target.value)}
                    placeholder="Somente números"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Razão Social</Label>
                  <Input
                    value={form.nomerazaosocial}
                    onChange={(e) => handleChange("nomerazaosocial", e.target.value)}
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

              {/* Status dentro do diálogo */}
              <div className="mt-4 flex items-center justify-between rounded-md border px-3 py-2 bg-muted/40">
                <div className="space-y-0.5">
                  <Label>Status do fornecedor</Label>
                  <p className="text-xs text-muted-foreground">
                    Defina se este fornecedor está ativo para uso nas telas do sistema.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {form.ativo ? "Ativo" : "Inativo"}
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
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Container da tabela (padrão das outras páginas, sem Card) */}
      <div className="rounded-md border bg-background px-4 pb-4 pt-0 relative min-h-[190px]">
        {/* Barrinha de loading no topo, igual usuários */}
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
              <TableHead>Razão Social</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Cidade / UF</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              linhasSkeleton
            ) : total === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhum fornecedor cadastrado. Clique em <b>Novo fornecedor</b> para cadastrar.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((f) => (
                <TableRow key={f.id} className="hover:cursor-default">
                  <TableCell className="font-medium">
                    {f.nomerazaosocial}
                    {f.nomefantasia && (
                      <div className="text-[11px] text-muted-foreground">
                        Fantasia: {f.nomefantasia}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{f.cpfcnpj}</TableCell>
                  <TableCell className="text-sm">
                    {f.cidade || "—"}
                    {f.estado && ` / ${f.estado}`}
                  </TableCell>
                  <TableCell className="text-sm">{f.contato || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={f.ativo ? "default" : "outline"}
                      className={f.ativo ? "" : "border-destructive bg-destructive"}
                    >
                      {f.ativo ? "Ativo" : "Inativo"}
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
                        <DropdownMenuItem onClick={() => openEditar(f)}>
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

        {/* Paginação no rodapé, padrão TabelaUsuarios */}
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
              <SelectTrigger size="sm" className="hover:cursor-pointer ml-2 w-[80px]">
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
