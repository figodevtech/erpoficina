"use client";

import { MoreHorizontal, Pencil, Link2, DollarSign, Send, FileSignature, Undo2, ShieldCheck, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import type { StatusOS } from "./ordens-tabs";

type Row = any;

export function RowActions({
  row,
  policy,
  onOpenOrcamento,
  onEditar,
  setStatus,
  setLinkRow,
  setLinkDialogOpen,
  setConfirmRow,
  setConfirmOpen,
  setPayRow,
  setPayOpen,
  setDetailsId,
  setDetailsOpen,
  setDelRow,
  setDelOpen,
}: {
  row: Row;
  policy: {
    canEditBudget: boolean;
    showEditOS: boolean;          // <- NOVO
    showLinkAprov: boolean;
    showCancelBudget: boolean;
    showApproveBudget: boolean;
  };
  onOpenOrcamento: (row: Row) => void;
  onEditar: (row: Row) => void;
  setStatus: (id: number, status: Exclude<StatusOS, never>) => Promise<void>;
  setLinkRow: (row: Row) => void;
  setLinkDialogOpen: (v: boolean) => void;
  setConfirmRow: (row: Row) => void;
  setConfirmOpen: (v: boolean) => void;
  setPayRow: (row: Row) => void;
  setPayOpen: (v: boolean) => void;
  setDetailsId: (id: number | null) => void;
  setDetailsOpen: (v: boolean) => void;
  setDelRow: (row: Row) => void;
  setDelOpen: (v: boolean) => void;
}) {
  const { canEditBudget, showEditOS, showLinkAprov, showCancelBudget, showApproveBudget } = policy;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>

        {/* Detalhes */}
        <DropdownMenuItem onClick={() => { setDetailsId(row.id); setDetailsOpen(true); }}>
          <Eye className="mr-2 h-4 w-4" />
          Detalhes
        </DropdownMenuItem>

        {/* Editar OS — só em ORCAMENTO */}
        {showEditOS && (
          <DropdownMenuItem onClick={() => onEditar(row)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar OS
          </DropdownMenuItem>
        )}

        {/* Editar Orçamento — só em ORCAMENTO */}
        {canEditBudget && (
          <DropdownMenuItem onClick={() => onOpenOrcamento(row)}>
            <FileSignature className="mr-2 h-4 w-4" />
            Editar Orçamento
          </DropdownMenuItem>
        )}

        {/* Link de aprovação (oculto em ORCAMENTO) */}
        {showLinkAprov && (
          <DropdownMenuItem
            onClick={() => {
              setLinkRow(row);
              setLinkDialogOpen(true);
            }}
          >
            <Link2 className="mr-2 h-4 w-4" />
            Link de aprovação
          </DropdownMenuItem>
        )}

        {/* Cancelar orçamento (voltar p/ ORCAMENTO) */}
        {showCancelBudget && (
          <DropdownMenuItem onClick={() => setStatus(row.id, "ORCAMENTO")}>
            <Undo2 className="mr-2 h-4 w-4" />
            Cancelar orçamento
          </DropdownMenuItem>
        )}

        {/* Aprovar orçamento (ADM) -> ORCAMENTO_APROVADO */}
        {showApproveBudget && (
          <DropdownMenuItem onClick={() => setStatus(row.id, "ORCAMENTO_APROVADO")}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Aprovar orçamento
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Enviar p/ pagamento */}
        <DropdownMenuItem
          onClick={() => {
            setConfirmRow(row);
            setConfirmOpen(true);
          }}
        >
          <Send className="mr-2 h-4 w-4" />
          Enviar p/ pagamento
        </DropdownMenuItem>

        {/* Receber Pagamento */}
        <DropdownMenuItem
          onClick={() => {
            setPayRow(row);
            setPayOpen(true);
          }}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Receber pagamento
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Excluir */}
        <DropdownMenuItem
          className="text-red-600 focus:text-red-700"
          onClick={() => { setDelRow(row); setDelOpen(true); }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir OS
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
