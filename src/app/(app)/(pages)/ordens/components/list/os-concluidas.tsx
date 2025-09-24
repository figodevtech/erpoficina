"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Search, DollarSign, Eye, Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type OSConcluida = {
  id: number;
  numero: string;
  cliente: string;
  veiculo: string;
  descricao: string;
  status: string;
  tecnico: string;
  criadaEm: string | null;
  concluidaEm: string | null;
  temProdutos: boolean;
  setor?: string | null;
};

type Props = {
  lista: OSConcluida[];
  loading?: boolean;
  error?: string | null;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  onRefresh?: () => void;
  onAbrirProdutos: (os: OSConcluida) => void;

  page?: number;
  totalPages?: number;
  onPageChange?: (p: number) => void;

  limit?: number;
  onLimitChange?: (v: number) => void;
};

export function OSConcluidasCard({
  lista,
  loading = false,
  error = null,
  searchValue = "",
  onSearchChange,
  onRefresh,
  onAbrirProdutos,
  page = 1,
  totalPages = 1,
  onPageChange,
  limit = 20,
  onLimitChange,
}: Props) {
  const prev = () => onPageChange?.(Math.max(1, page - 1));
  const next = () => onPageChange?.(Math.min(totalPages, page + 1));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <FileText className="h-5 w-5" />
          Ordens de Serviço Concluídas
        </CardTitle>
        <CardDescription>Adicione produtos e serviços às OS concluídas para gerar orçamentos</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Busca + atualizar */}
        <div className="flex w-full gap-2">
          <div className="flex-1">
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Buscar por descrição ou número…"
              className="h-10"
            />
          </div>
          <Button variant="outline" className="shrink-0" onClick={onRefresh} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Atualizar
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Tabela (desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Número OS</TableHead>
                <TableHead className="min-w-[180px]">Cliente</TableHead>
                <TableHead className="min-w-[180px]">Veículo</TableHead>
                <TableHead className="min-w-[260px]">Descrição</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[160px]">Concluída em</TableHead>
                <TableHead className="min-w-[160px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    <TableCell colSpan={7}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : lista.length > 0 ? (
                lista.map((os) => (
                  <TableRow key={os.id}>
                    <TableCell className="font-medium">{os.numero}</TableCell>
                    <TableCell className="truncate">{os.cliente}</TableCell>
                    <TableCell className="truncate">{os.veiculo}</TableCell>
                    <TableCell className="max-w-[420px] truncate">{os.descricao}</TableCell>
                    <TableCell>
                      <Badge
                        className="bg-green-100 text-green-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                        variant="secondary"
                      >
                        {os.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{os.concluidaEm ? new Date(os.concluidaEm).toLocaleString() : "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAbrirProdutos(os)}
                          aria-label="Produtos/Serviços"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" aria-label="Ver detalhes">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="w-full py-8 text-center text-muted-foreground">
                      Nenhuma OS concluída encontrada.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Cards (mobile) */}
        <div className="md:hidden space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={`skm-${i}`} className="rounded-lg border p-4">
                <div className="h-4 w-32 mb-2 animate-pulse rounded bg-muted" />
                <div className="h-4 w-48 mb-2 animate-pulse rounded bg-muted" />
                <div className="h-4 w-60 mb-2 animate-pulse rounded bg-muted" />
                <div className="flex justify-end">
                  <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))
          ) : lista.length > 0 ? (
            lista.map((os) => (
              <div key={os.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{os.numero}</div>
                  <Badge
                    className="bg-green-100 text-green-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                    variant="secondary"
                  >
                    {os.status}
                  </Badge>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Cliente: </span>
                  {os.cliente}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Veículo: </span>
                  {os.veiculo}
                </div>
                <div className="text-sm line-clamp-2">
                  <span className="text-muted-foreground">Descrição: </span>
                  {os.descricao}
                </div>
                <div className="text-xs text-muted-foreground">
                  Concluída em: {os.concluidaEm ? new Date(os.concluidaEm).toLocaleString() : "—"}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => onAbrirProdutos(os)}>
                    <DollarSign className="h-4 w-4 mr-1" /> Itens
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" /> Detalhes
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border p-6 text-center text-muted-foreground">
              Nenhuma OS concluída encontrada.
            </div>
          )}
        </div>

        {/* Rodapé: linhas por página (esq) + paginação (centro) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3 pt-2">
          {/* ESQUERDA */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Linhas por página:</span>
            <Select value={String(limit)} onValueChange={(v) => onLimitChange?.(Number(v))}>
              <SelectTrigger className="h-9 w-[88px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CENTRO */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" onClick={prev} disabled={loading || page <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              <strong>{page}</strong>/<strong>{totalPages}</strong>
            </span>
            <Button variant="outline" size="icon" onClick={next} disabled={loading || page >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* DIREITA (vazio para balancear) */}
          <div />
        </div>
      </CardContent>
    </Card>
  );
}
