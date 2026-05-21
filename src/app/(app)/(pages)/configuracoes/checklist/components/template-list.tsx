"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChecklistTemplate } from "./types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

import {
  ChevronsLeft,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronsRight,
  Loader2,
  MoreHorizontal,
  Eye,
  Edit3,
  Plus,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  items: ChecklistTemplate[];
  loading?: boolean;
  error?: string | null;
  onReload?: () => void;
  onNew?: () => void;
  onEdit: (tpl: ChecklistTemplate) => void;
  onDelete: (id: string) => void; // mantido pra não quebrar quem chama, mas não é usado
};

export function TemplatesList({
  items,
  loading,
  error,
  onReload,
  onNew,
  onEdit,
}: Props) {
  // visualização
  const [openView, setOpenView] = useState(false);
  const [selected, setSelected] = useState<ChecklistTemplate | null>(null);

  // paginação local (client-side)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const start = (page - 1) * limit;
  const end = Math.min(total, start + limit);
  const pageItems = items.slice(start, end);

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
            <div className="h-3 w-10 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-24 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-6 w-12 bg-muted rounded" />
          </TableCell>
          <TableCell className="text-right">
            <div className="h-6 w-6 bg-muted rounded-full ml-auto" />
          </TableCell>
        </TableRow>
      )),
    [limit],
  );

  return (
    <Card>
      {/* Header no padrão das outras telas */}
      <CardHeader className="border-b-2 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Modelos de Checklist</CardTitle>
            <CardDescription className="flex items-center gap-2">
              {onReload ? (
                <button
                  onClick={onReload}
                  className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground/70"
                >
                  <span>Recarregar</span>
                  <Loader2
                    width={12}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
              ) : (
                <span className="text-foreground/60">
                  {total} modelo{total === 1 ? "" : "s"}
                  {error && (
                    <Badge variant="destructive" className="ml-2">
                      {error}
                    </Badge>
                  )}
                </span>
              )}
            </CardDescription>
          </div>

          {/* Botão “Novo checklist” no canto superior direito */}
          <div className="flex items-center gap-2">
            {onNew && (
              <Button
                onClick={onNew}
                className="hover:cursor-pointer"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Novo checklist
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-h-[190px] -mt-[24px] px-4 pb-4 pt-0 relative">
        {/* Barra fina de loading no topo do CardContent (igual às outras telas) */}
        <div
          className={`${
            loading ? "opacity-100" : ""
          } transition-all opacity-0 h-0.5 bg-slate-400 w-full overflow-hidden absolute left-0 right-0 top-0`}
        >
          <div
            className={`w-1/2 bg-primary h-full absolute left-0 rounded-lg -translate-x-[100%] ${
              loading ? "animate-slideIn" : ""
            }`}
          />
        </div>

        {/* Tabela */}
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              linhasSkeleton
            ) : total === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  Nenhum checklist criado. Clique em <b>Novo checklist</b> para
                  começar.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((c) => {
                const isActive = c.ativo !== false; // default = ativo
                return (
                  <TableRow key={c.id} className="hover:cursor-default">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{c.nome}</span>
                        {c.descricao && (
                          <span className="text-xs text-muted-foreground hidden lg:inline max-w-[36ch] truncate">
                            — {c.descricao}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.categoria ? (
                        <Badge variant="secondary">{c.categoria}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {c.itens.length}
                    </TableCell>
                    <TableCell>
                      {c.criadoEm
                        ? new Date(c.criadoEm).toLocaleDateString("pt-BR")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isActive ? "default" : "outline"}
                        className={
                          isActive ? "" : "border-destructive bg-destructive"
                        }
                      >
                        {isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelected(c);
                              setOpenView(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" /> Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(c)}>
                            <Edit3 className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          {/* opção Excluir removida como você pediu */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Footer com infos e paginação local (mesmo estilo) */}
        <div className="flex items-center mt-4 justify-between">
          <div className="text-xs text-muted-foreground mr-2 flex flex-nowrap">
            {total > 0 ? (
              <>
                <span>{start + 1}</span>
                {" - "}
                <span>{end}</span>
                <span className="ml-1 hidden sm:block">de {total}</span>
              </>
            ) : (
              <span>0 de 0</span>
            )}
          </div>

          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="hover:cursor-pointer"
              onClick={() => setPage(1)}
              disabled={page === 1 || total === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hover:cursor-pointer"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || total === 0}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-nowrap">
              Pg. {Math.min(page, totalPages)} de {totalPages}
            </span>
            <Button
              className="hover:cursor-pointer"
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || total === 0}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              className="hover:cursor-pointer"
              variant="outline"
              size="icon"
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
              <SelectTrigger className="hover:cursor-pointer ml-2">
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
      </CardContent>

      {/* Dialog de visualização (somente leitura) */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent
          className="h-svh min-w-screen overflow-hidden p-0 sm:h-[85vh] sm:min-h-[620px] sm:max-h-[820px] sm:w-[90vw] sm:min-w-0 sm:max-w-[1000px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex h-full min-h-0 flex-col">
            <DialogHeader className="shrink-0 border-b px-6 py-4">
              <DialogTitle className="text-lg font-semibold">
                {selected?.nome}
              </DialogTitle>
              {selected?.descricao && (
                <CardDescription className="pt-1">
                  {selected.descricao}
                </CardDescription>
              )}
            </DialogHeader>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-6 dark:bg-muted-foreground/5">
              {selected?.itens.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 border rounded-lg bg-muted/50 max-w-full"
                >
                  <Checkbox disabled className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{item.titulo}</h4>
                      {item.obrigatorio && (
                        <Badge variant="destructive" className="text-xs">
                          Obrigatório
                        </Badge>
                      )}
                      {item.categoria && (
                        <Badge variant="outline" className="text-xs">
                          {item.categoria}
                        </Badge>
                      )}
                    </div>
                    {item.descricao && (
                      <p className="text-sm text-muted-foreground break-words">
                        {item.descricao}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
