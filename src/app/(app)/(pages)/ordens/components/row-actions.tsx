"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  DollarSign,
  Link2,
  Send,
  Wallet,
  CreditCard,
  Pencil,
  Eye,
  Trash2,
  Play,
} from "lucide-react";
import type { StatusOS } from "./ordens-tabs";

// Tipagem mínima do que o Row precisa (evita dependência circular)
type RowLike = {
  id: number;
  status?: string | null;
  cliente?: { nome?: string | null } | null;
};

export function RowActions({
  row,
  onOpenOrcamento,
  onEditar,
  setStatus,
  setLinkRow, setLinkDialogOpen,
  setConfirmRow, setConfirmOpen,
  setPayRow, setPayOpen,
  setDetailsId, setDetailsOpen,
  setDelRow, setDelOpen,
}: {
  row: RowLike;
  onOpenOrcamento: (row: any) => void;
  onEditar: (row: any) => void;
  setStatus: (id: number, s: Exclude<StatusOS, "TODAS">) => Promise<void> | void;
  setLinkRow: (r: any | null) => void;
  setLinkDialogOpen: (v: boolean) => void;
  setConfirmRow: (r: any | null) => void;
  setConfirmOpen: (v: boolean) => void;
  setPayRow: (r: any | null) => void;
  setPayOpen: (v: boolean) => void;
  setDetailsId: (id: number | null) => void;
  setDetailsOpen: (v: boolean) => void;
  setDelRow: (r: any | null) => void;
  setDelOpen: (v: boolean) => void;
}) {
  const st = (row.status ?? "ORCAMENTO") as Exclude<StatusOS, "TODAS">;
  const podeLink = st === "ORCAMENTO" || st === "APROVACAO_ORCAMENTO";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="px-2" aria-label="Ações da OS">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>

        <DropdownMenuItem onClick={() => { setDetailsId(row.id); setDetailsOpen(true); }}>
          <Eye className="mr-2 h-4 w-4" /> <span>Detalhes</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onOpenOrcamento(row)}>
          <DollarSign className="mr-2 h-4 w-4" /> <span>Orçamento</span>
        </DropdownMenuItem>

        {podeLink && (
          <DropdownMenuItem onClick={() => { setLinkRow(row); setLinkDialogOpen(true); }}>
            <Link2 className="mr-2 h-4 w-4" /> <span>Link de aprovação…</span>
          </DropdownMenuItem>
        )}

        {st === "ORCAMENTO" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStatus(row.id, "APROVACAO_ORCAMENTO")}>
              <Send className="mr-2 h-4 w-4" /> <span>Enviar p/ aprovação</span>
            </DropdownMenuItem>
          </>
        )}

        {st === "ORCAMENTO_APROVADO" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStatus(row.id, "EM_ANDAMENTO")}>
              <Play className="mr-2 h-4 w-4" /> <span>Iniciar OS</span>
            </DropdownMenuItem>
          </>
        )}

        {st === "EM_ANDAMENTO" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => { e.preventDefault(); setConfirmRow(row); setTimeout(() => setConfirmOpen(true), 10); }}
            >
              <Wallet className="mr-2 h-4 w-4" /> <span>Finalizar e enviar p/ pagamento…</span>
            </DropdownMenuItem>
          </>
        )}

        {st === "PAGAMENTO" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setPayRow(row); setPayOpen(true); }}>
              <CreditCard className="mr-2 h-4 w-4" /> <span>Receber pagamento…</span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEditar(row)}>
          <Pencil className="mr-2 h-4 w-4" /> <span>Editar OS</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onSelect={(e) => { e.preventDefault(); setDelRow(row); setTimeout(() => setDelOpen(true), 10); }}
        >
          <Trash2 className="mr-2 h-4 w-4" /> <span>Excluir OS…</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
