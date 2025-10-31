"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  FileEdit,
  Pencil,
  Link2,
  ThumbsUp,
  RotateCcw,
  Play,
  Send,
  Wallet,
  Eye,
  Trash2,
  XCircle,
} from "lucide-react";

/** Tipo base mínimo da linha */
export type RowBase = {
  id: number;
  status?: string | null;
  descricao?: string | null;
  prioridade?: "ALTA" | "NORMAL" | "BAIXA" | null;
  cliente?: { nome?: string | null } | null;
  veiculo?: { placa?: string | null; modelo?: string | null; marca?: string | null } | null;
  alvo_tipo?: "VEICULO" | "PECA" | null;
  setor?: { nome?: string | null } | null;
};

/** Mantido por compatibilidade com quem chama. */
type Policy = {
  canEditBudget: boolean;
  showEditOS: boolean;
  showLinkAprov: boolean;
  showCancelBudget: boolean;
  showApproveBudget: boolean;
  showStart: boolean;
  showSendToPayment: boolean;
  showReceivePayment: boolean;
};

export function RowActions<TRow extends RowBase>({
  row,
  policy, // visibilidade calculada aqui; mantido por compat.
  onOpenOrcamento,
  onEditar,
  setStatus,
  // dialogs
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
  row: TRow;
  policy: Policy;
  onOpenOrcamento: (row: TRow) => void;
  onEditar: (row: TRow) => void;
  setStatus: (id: number, status: any) => Promise<void> | void;

  setLinkRow: (row: TRow | null) => void;
  setLinkDialogOpen: (open: boolean) => void;

  setConfirmRow: (row: TRow | null) => void;
  setConfirmOpen: (open: boolean) => void;

  setPayRow: (row: TRow | null) => void;
  setPayOpen: (open: boolean) => void;

  setDetailsId: (id: number | null) => void;
  setDetailsOpen: (open: boolean) => void;

  setDelRow: (row: TRow | null) => void;
  setDelOpen: (open: boolean) => void;
}) {
  const st = String(row.status ?? "").toUpperCase();

  // Regras de visibilidade
  const showEditOS = st === "ORCAMENTO"; // Editar OS só em ORCAMENTO
  const showBudget = st === "ORCAMENTO" || st === "ORCAMENTO_RECUSADO"; // Orçamento em ORCAMENTO e ORCAMENTO_RECUSADO

  // Link de aprovação: ORCAMENTO, APROVACAO_ORCAMENTO e ORCAMENTO_RECUSADO
  const showLinkAprov =
    st === "ORCAMENTO" || st === "APROVACAO_ORCAMENTO" || st === "ORCAMENTO_RECUSADO";

  // Aprovação (fluxo)
  const showApproveBudget = st === "APROVACAO_ORCAMENTO";
  const showCancelBudget = st === "APROVACAO_ORCAMENTO"; // volta para ORCAMENTO

  // Orçamento recusado: permitir cancelar OS
  const showCancelOSRecusado = st === "ORCAMENTO_RECUSADO"; // muda para CANCELADO

  // Produção / Pagamento
  const showStart = st === "ORCAMENTO_APROVADO";   // -> EM_ANDAMENTO
  const showSendToPayment = st === "EM_ANDAMENTO"; // abre confirmação para PAGAMENTO
  const showReceivePayment = st === "PAGAMENTO";   // abre dialog de recebimento

  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Mais ações">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Orçamento / Editar OS */}
          {showBudget && (
            <DropdownMenuItem onClick={() => onOpenOrcamento(row)}>
              <FileEdit className="mr-2 h-4 w-4" />
              Orçamento
            </DropdownMenuItem>
          )}
          {showEditOS && (
            <DropdownMenuItem onClick={() => onEditar(row)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar OS
            </DropdownMenuItem>
          )}

          {/* Fluxo de aprovação */}
          {showApproveBudget && (
            <DropdownMenuItem onClick={() => setStatus(row.id, "ORCAMENTO_APROVADO")}>
              <ThumbsUp className="mr-2 h-4 w-4" />
              Aprovar orçamento
            </DropdownMenuItem>
          )}
          {showCancelBudget && (
            <DropdownMenuItem onClick={() => setStatus(row.id, "ORCAMENTO")}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Cancelar orçamento
            </DropdownMenuItem>
          )}

          {/* Link de aprovação */}
          {showLinkAprov && (
            <DropdownMenuItem
              onClick={() => {
                setLinkRow(row);
                setLinkDialogOpen(true);
              }}
            >
              <Link2 className="mr-2 h-4 w-4" />
              Gerar link de aprovação
            </DropdownMenuItem>
          )}

          {/* Em orçamento recusado: opção de cancelar OS */}
          {showCancelOSRecusado && (
            <DropdownMenuItem onClick={() => setStatus(row.id, "CANCELADO")}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar OS
            </DropdownMenuItem>
          )}

          {/* Início de atendimento */}
          {showStart && (
            <DropdownMenuItem onClick={() => setStatus(row.id, "EM_ANDAMENTO")}>
              <Play className="mr-2 h-4 w-4" />
              Iniciar
            </DropdownMenuItem>
          )}

          {/* Pagamentos */}
          {showSendToPayment && (
            <DropdownMenuItem
              onClick={() => {
                setConfirmRow(row);
                setConfirmOpen(true);
              }}
            >
              <Send className="mr-2 h-4 w-4" />
              Enviar p/ pagamento
            </DropdownMenuItem>
          )}
          {showReceivePayment && (
            <DropdownMenuItem
              onClick={() => {
                setPayRow(row);
                setPayOpen(true);
              }}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Receber pagamento
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Gerais */}
          <DropdownMenuItem
            onClick={() => {
              setDetailsId(row.id);
              setDetailsOpen(true);
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            Detalhes
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => {
              setDelRow(row);
              setDelOpen(true);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
