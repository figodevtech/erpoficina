// ./src/app/(app)/(pages)/ordens/components/row-actions.tsx
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
  XCircle,
  RotateCcw,
  Play,
  Send,
  Wallet,
  Eye,
  Trash2,
  ClipboardList,
  CreditCard,
} from "lucide-react";

/** Tipo base mínimo da linha */
export type RowBase = {
  id: number;
  status?: string | null;
  descricao?: string | null;
  prioridade?: "ALTA" | "NORMAL" | "BAIXA" | null;
  cliente?: { nome?: string | null } | null;
  veiculo?: {
    placa?: string | null;
    modelo?: string | null;
    marca?: string | null;
  } | null;
  alvo_tipo?: "VEICULO" | "PECA" | null;
  setor?: { nome?: string | null } | null;
};

type Policy = {
  canEditBudget: boolean;
  showEditOS: boolean;
  showLinkAprov: boolean;
  showCancelBudget: boolean;
  showApproveBudget: boolean;
  showRejectBudget: boolean;
  showSendToApproval: boolean;
  showStart: boolean;
  showSendToPayment: boolean;
  showReceivePayment: boolean;
  showStonePayment: boolean;
};

export function RowActions<TRow extends RowBase>({
  row,
  policy,
  onOpenOrcamento,
  onEditar,
  setStatus,
  onSendToApproval, // NOVO
  // dialogs
  setLinkRow,
  setLinkDialogOpen,
  setConfirmRow,
  setConfirmOpen,
  setPayRow,
  setPayOpen,
  setDetailsId,
  setDetailsOpen,
  setChecklistRow,
  setChecklistOpen,
  setStoneRow,
  setStoneOpen,
}: {
  row: TRow;
  policy: Policy;
  onOpenOrcamento: (row: TRow) => void;
  onEditar: (row: TRow) => void;
  setStatus: (id: number, status: any) => Promise<any> | void;
  onSendToApproval: (row: TRow) => void; // NOVO
  setLinkRow: (row: TRow | null) => void;
  setLinkDialogOpen: (open: boolean) => void;
  setConfirmRow: (row: TRow | null) => void;
  setConfirmOpen: (open: boolean) => void;
  setPayRow: (row: TRow | null) => void;
  setPayOpen: (open: boolean) => void;
  setDetailsId: (id: number | null) => void;
  setDetailsOpen: (open: boolean) => void;
  setChecklistRow: (row: TRow | null) => void;
  setChecklistOpen: (open: boolean) => void;
  setStoneRow: (row: TRow | null) => void;
  setStoneOpen: (open: boolean) => void;
}) {
  const st = String(row.status ?? "").toUpperCase();

  // Checklist
  const showChecklist = st === "AGUARDANDO_CHECKLIST";

  // ===== Regras baseadas em STATUS + POLICY =====

  // Orçamento (abrir tela de orçamento)
  const showBudget =
    (st === "ORCAMENTO" || st === "ORCAMENTO_RECUSADO") &&
    policy.canEditBudget;

  // Editar OS
  const showEditOS = st === "ORCAMENTO" && policy.showEditOS;

  // Link de aprovação (NÃO mostra em ORCAMENTO_RECUSADO)
  const showLinkAprov =
    policy.showLinkAprov &&
    (st === "ORCAMENTO" || st === "APROVACAO_ORCAMENTO");

  // Fluxo de aprovação
  const showApproveBudget =
    policy.showApproveBudget && st === "APROVACAO_ORCAMENTO";

  const showRejectBudget =
    policy.showRejectBudget && st === "APROVACAO_ORCAMENTO";

  // Cancelar orçamento: em APROVACAO_ORCAMENTO ou ORCAMENTO_RECUSADO
  const showCancelBudget =
    policy.showCancelBudget &&
    (st === "APROVACAO_ORCAMENTO" || st === "ORCAMENTO_RECUSADO");

  // Enviar orçamento para aprovação (ORCAMENTO ou ORCAMENTO_RECUSADO)
  const showSendToApproval =
    policy.showSendToApproval &&
    (st === "ORCAMENTO" || st === "ORCAMENTO_RECUSADO");

  // Orçamento recusado: permitir cancelar OS (muda status p/ CANCELADO)
  const showCancelOSRecusado = st === "ORCAMENTO_RECUSADO";

  // Produção / Pagamento
  const showStart = policy.showStart && st === "ORCAMENTO_APROVADO"; // -> EM_ANDAMENTO
  const showSendToPayment =
    policy.showSendToPayment && st === "EM_ANDAMENTO"; // -> PAGAMENTO
  const showReceivePayment =
    policy.showReceivePayment && st === "PAGAMENTO"; // finalizar pagamento
  const showStonePayment =
    policy.showStonePayment && st === "PAGAMENTO"; // maquineta Stone

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>

        {/* Checklist: apenas quando aguardando checklist */}
        {showChecklist && (
          <DropdownMenuItem
            onClick={() => {
              setChecklistRow(row);
              setChecklistOpen(true);
            }}
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Checklist
          </DropdownMenuItem>
        )}

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

        {/* Enviar para aprovação -> agora passa pelo callback do pai */}
        {showSendToApproval && (
          <DropdownMenuItem onClick={() => onSendToApproval(row)}>
            <ThumbsUp className="mr-2 h-4 w-4" />
            Enviar para aprovação
          </DropdownMenuItem>
        )}

        {/* Fluxo de aprovação */}
        {showApproveBudget && (
          <DropdownMenuItem onClick={() => setStatus(row.id, "ORCAMENTO_APROVADO")}>
            <ThumbsUp className="mr-2 h-4 w-4" />
            Aprovar orçamento
          </DropdownMenuItem>
        )}

        {showRejectBudget && (
          <DropdownMenuItem onClick={() => setStatus(row.id, "ORCAMENTO_RECUSADO")}>
            <XCircle className="mr-2 h-4 w-4" />
            Reprovar orçamento
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

        {/* Orçamento recusado: cancelar OS (status CANCELADO, não excluir do sistema) */}
        {showCancelOSRecusado && (
          <DropdownMenuItem onClick={() => setStatus(row.id, "CANCELADO")}>
            <Trash2 className="mr-2 h-4 w-4" />
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

        {showStonePayment && (
          <DropdownMenuItem
            onClick={() => {
              setStoneRow(row);
              setStoneOpen(true);
            }}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Cobrar na maquineta
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Detalhes */}
        <DropdownMenuItem
          onClick={() => {
            setDetailsId(row.id);
            setDetailsOpen(true);
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          Detalhes
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
