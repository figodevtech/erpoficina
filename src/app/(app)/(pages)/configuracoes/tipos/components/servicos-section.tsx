// src/app/(app)/(pages)/configuracoes/tipos/components/servicos-section.tsx
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  ativo?: boolean | null;
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
  ativo: boolean;
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
  ativo: true,
};

// 🔹 limite padrão de 10 por página
const DEFAULT_LIMIT = 10;

export default function ServicosSection() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<Servico | null>(null);
  const [form, setForm] = useState<ServicoForm>(emptyForm);

  // paginação (padrão TabelaUsuarios / Fornecedores)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const total = servicos.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const start = (page - 1) * limit;
  const end = Math.min(total, start + limit);
  const pageItems = useMemo(
    () => servicos.slice(start, end),
    [servicos, start, end]
  );

  const linhasSkeleton = useMemo(
    () =>
      Array.from({ length: Math.min(5, limit) }).map((_, i) => (
        <TableRow key={`skeleton-${i}`} className="animate-pulse">
          <TableCell className="h-10">
            <div className="h-3 w-24 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-40 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-20 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-16 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-24 bg-muted rounded" />
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

  async function loadServicos() { 
    try {
      setIsLoading(true);
      setErro(null);

      const res = await fetch("/api/tipos/servicos", { cache: "no-store" });
      const j = await res.json();

      if (!res.ok) throw new Error(j?.error || "Falha ao carregar serviços");

      const items: Servico[] = (j.items ?? j.data ?? []).map((s: Servico) => ({
        ...s,
        ativo: s.ativo ?? true,
      }));

      setServicos(items);
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Erro ao carregar serviços";
      setErro(msg);
      toast.error(msg);
      setServicos([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadServicos();
  }, []);

  function handleChange<K extends keyof ServicoForm>(key: K, value: ServicoForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

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
      precohora:
        s.precohora !== null && s.precohora !== undefined
          ? String(s.precohora)
          : "",
      codigoservicomunicipal: s.codigoservicomunicipal ?? "",
      aliquotaiss:
        s.aliquotaiss !== null && s.aliquotaiss !== undefined
          ? String(s.aliquotaiss)
          : "",
      cnae: s.cnae ?? "",
      itemlistaservico: s.itemlistaservico ?? "",
      tiposervicoid:
        s.tiposervicoid !== null && s.tiposervicoid !== undefined
          ? String(s.tiposervicoid)
          : "",
      ativo: s.ativo ?? true,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.codigo.trim() || !form.descricao.trim()) {
      toast.error("Insira uma descrição.");
      return;
    }
    if (!form.precohora.trim() || Number.isNaN(Number(form.precohora))) {
      toast.error("Preço inválido.");
      return;
    }
    
    const payload = {
      codigo: form.codigo.trim(),
      descricao: form.descricao.trim(),
      precohora: Number(form.precohora),
      codigoservicomunicipal: form.codigoservicomunicipal.trim(),
      aliquotaiss: form.aliquotaiss.trim()
        ? Number(form.aliquotaiss)
        : null,
      cnae: form.cnae.trim() || null,
      itemlistaservico: form.itemlistaservico.trim(),
      tiposervicoid: form.tiposervicoid.trim()
        ? Number(form.tiposervicoid)
        : null,
      ativo: form.ativo,
    };

    try {
      setIsSaving(true);

      if (editing) {
        const res = await fetch(`/api/tipos/servicos/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || "Falha ao atualizar serviço");
        toast.success("Serviço atualizado");
      } else {
        const res = await fetch("/api/tipos/servicos", {
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

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho no estilo das outras tabelas */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Serviços</h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <span className="text-foreground/60">
              {total} serviço{total === 1 ? "" : "s"}
            </span>
            {erro && (
              <Badge variant="destructive" className="ml-1">
                {erro}
              </Badge>
            )}
            <button
              onClick={loadServicos}
              className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground/70 ml-2 text-xs"
            >
              <span>Recarregar</span>
              <Loader2 width={12} className={isLoading ? "animate-spin" : ""} />
            </button>
          </p>
        </div>

        {/* Botão Novo serviço + Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="hover:cursor-pointer" onClick={openNovo}>
              <Plus className="mr-1 h-4 w-4" />
              Novo serviço
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar serviço" : "Novo serviço"}
              </DialogTitle>
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
                    onChange={(e) =>
                      handleChange("codigoservicomunicipal", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleChange("itemlistaservico", e.target.value)
                    }
                    placeholder="Ex.: 14.01"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tipo de serviço (ID)</label>
                  <Input
                    value={form.tiposervicoid}
                    onChange={(e) =>
                      handleChange("tiposervicoid", e.target.value)
                    }
                    placeholder="ID da categoria do serviço (opcional)"
                  />
                </div>
              </div>

              {/* Status dentro do diálogo */}
              <div className="mt-4 flex items-center justify-between rounded-md border px-3 py-2 bg-muted/40">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">Status do serviço</span>
                  <p className="text-xs text-muted-foreground">
                    Defina se este serviço está ativo para uso nas ordens de serviço.
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

      {/* Tabela de serviços, no padrão das outras páginas (sem Card) */}
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
              <TableHead>Código</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Preço/hora</TableHead>
              <TableHead>Item lista</TableHead>
              <TableHead>Cód. mun.</TableHead>
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
                  Nenhum serviço cadastrado. Clique em <b>Novo serviço</b> para cadastrar.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((s) => (
                <TableRow key={s.id} className="hover:cursor-default">
                  <TableCell className="font-mono text-xs">{s.codigo}</TableCell>
                  <TableCell>{s.descricao}</TableCell>
                  <TableCell>
                    {s.precohora != null
                      ? Number(s.precohora).toFixed(2)
                      : "—"}
                  </TableCell>
                  <TableCell>{s.itemlistaservico}</TableCell>
                  <TableCell>{s.codigoservicomunicipal}</TableCell>
                  <TableCell>
                    <Badge
                      variant={s.ativo ? "default" : "outline"}
                      className={s.ativo ? "" : "border-destructive bg-destructive"}
                    >
                      {s.ativo ? "Ativo" : "Inativo"}
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
                        <DropdownMenuItem onClick={() => openEditar(s)}>
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
                const n = parseInt(v, 10) || DEFAULT_LIMIT;
                setLimit(n);
                setPage(1);
              }}
            >
              <SelectTrigger size="sm" className="hover:cursor-pointer ml-2 w-[80px]">
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
