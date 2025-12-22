"use client";

import { useEffect, useMemo, useState } from "react";
import type { Perfil } from "../types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  ChevronsLeft,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronsRight,
  Loader2,
  MoreHorizontal,
  Edit3,
  Plus,
  Loader,
} from "lucide-react";

type Props = {
  items: Perfil[];
  loading?: boolean;
  error?: string | null;

  onReload?: () => void;
  onNew?: () => void;
  onEdit: (p: Perfil) => void;

  /** se sua página já estiver dentro de um Card, ligue isso pra não ficar Card dentro de Card */
  semCard?: boolean;
};

export function TabelaPerfis({ items, loading, error, onReload, onNew, onEdit, semCard }: Props) {
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
            <div className="h-3 w-56 bg-muted rounded" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-24 bg-muted rounded" />
          </TableCell>
          <TableCell className="text-right">
            <div className="h-6 w-6 bg-muted rounded-full ml-auto" />
          </TableCell>
        </TableRow>
      )),
    [limit]
  );

  const Conteudo = (
    <>
      <div className="border-b-2 pb-4 px-6 pt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Perfis de Permissões</CardTitle>
            <CardDescription className="flex items-center gap-2">
              {onReload ? (
                <button
                  onClick={onReload}
                  className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground/70"
                >
                  <span>Recarregar</span>
                  <Loader2 width={12} className={loading ? "animate-spin" : ""} />
                </button>
              ) : (
                <span className="text-foreground/60">
                  {total} perfil{total === 1 ? "" : "s"}
                  {error && (
                    <Badge variant="destructive" className="ml-2">
                      {error}
                    </Badge>
                  )}
                </span>
              )}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {onNew && (
              <Button onClick={onNew} className="hover:cursor-pointer" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Novo perfil
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-[190px] -mt-[24px] px-4 pb-4 pt-0 relative">
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

        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              linhasSkeleton
            ) : total === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  Nenhum perfil encontrado. Clique em <b>Novo perfil</b> para cadastrar.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((p) => (
                <TableRow key={String(p.id)} className="hover:cursor-default">
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell className="truncate">{p.descricao || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{(p.permissoes?.length ?? 0).toString()}</Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onEdit(p)}>
                          <Edit3 className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

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

            <Loader className={`w-4 h-full animate-spin transition-all ml-2 opacity-0 ${loading ? "opacity-100" : ""}`} />
          </div>

          <div className="flex items-center justify-center space-x-1 sm:space-x-3">
            <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1 || total === 0}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
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
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages || total === 0}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages || total === 0}>
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
    </>
  );

  if (semCard) {
    // sem Card (pra não ficar Card dentro de Card)
    return <div className="w-full">{Conteudo}</div>;
  }

  return (
    <Card>
      {Conteudo}
      {/* Conteudo já inclui header/body; aqui não usamos CardHeader/CardContent
          pra manter exatamente o layout estilo tabela-usuarios */}
    </Card>
  );
}
