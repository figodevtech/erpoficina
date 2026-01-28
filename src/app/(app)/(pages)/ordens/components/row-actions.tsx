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
  ClipboardList,
  CreditCard,
  Trash2,
  X,
  Printer,
  Gift,
} from "lucide-react";
import { useConfig } from "../../config-context";

/** Tipo base mínimo da linha */
export type RowBase = {
  id: number;
  status?: string | null;
  descricao?: string | null;
  prioridade?: "ALTA" | "NORMAL" | "BAIXA" | null;
  cliente?: { nome?: string | null; telefone?: string | null } | null;
  veiculo?: { placa?: string | null; modelo?: string | null; marca?: string | null } | null;
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
  onSendToApproval,

  // ✅ novos callbacks
  onCancelarOS,
  onResetOS,
  onFinalizeNoCharge,

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
  setEmissaoId,
  setEmissaoOpen,
}: {
  row: TRow;
  policy: Policy;
  onOpenOrcamento: (row: TRow) => void;
  onEditar: (row: TRow) => void;
  setStatus: (id: number, status: any) => Promise<any> | void;
  onSendToApproval: (row: TRow) => void;

  onCancelarOS: (row: TRow) => void;
  onResetOS: (row: TRow) => void;
  onFinalizeNoCharge: (row: TRow) => void;

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
  setEmissaoId: (id: number) => void;
  setEmissaoOpen: (open: boolean) => void;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL
  const config = useConfig();
  const st = String(row.status ?? "").toUpperCase();

  const showChecklist = st === "AGUARDANDO_CHECKLIST";

  // ✅ finais: sem reset/cancelar
  const isFinalState = st === "CANCELADO" || st === "FINALIZADA" || st === "CONCLUIDO" || st === "SEM_COBRANCA";

  // ✅ reset: exceto aguardando_orcamento e orcamento, e exceto finais
  const showResetOS = !isFinalState && st !== "AGUARDANDO_ORCAMENTO" && st !== "ORCAMENTO" && st !== "AGUARDANDO_CHECKLIST";

  // ✅ cancelar: exceto finais
  const showCancelarOS = !isFinalState;

  // Orçamento
  const showBudget = (st === "ORCAMENTO" || st === "ORCAMENTO_RECUSADO") && policy.canEditBudget;

  // Editar OS
  const showEditOS = st === "ORCAMENTO" && policy.showEditOS;

  // Link aprovação
  const showLinkAprov = policy.showLinkAprov && st === "APROVACAO_ORCAMENTO";

  // Aprovar/reprovar
  const showApproveBudget = policy.showApproveBudget && st === "APROVACAO_ORCAMENTO";
  const showRejectBudget = policy.showRejectBudget && st === "APROVACAO_ORCAMENTO";

  // Cancelar orçamento
  const showCancelBudget = policy.showCancelBudget && (st === "APROVACAO_ORCAMENTO" || st === "ORCAMENTO_RECUSADO");

  // Enviar p/ aprovação
  const showSendToApproval = policy.showSendToApproval && (st === "ORCAMENTO" || st === "ORCAMENTO_RECUSADO");

  const showEmissaoDeNota = st === "CONCLUIDO";

  // Produção / Pagamento
  const showStart = policy.showStart && st === "ORCAMENTO_APROVADO";
  const showSendToPayment = policy.showSendToPayment && st === "EM_ANDAMENTO";
  const showReceivePayment = policy.showReceivePayment && st === "PAGAMENTO";
  const showFinishNoCharge = st === "EM_ANDAMENTO";

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

        {showSendToApproval && (
          <DropdownMenuItem onClick={() => onSendToApproval(row)}>
            <ThumbsUp className="mr-2 h-4 w-4" />
            Enviar para aprovação
          </DropdownMenuItem>
        )}

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

        {/* {showCancelBudget && (
          <DropdownMenuItem onClick={() => setStatus(row.id, "ORCAMENTO")}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Cancelar orçamento
          </DropdownMenuItem>
        )} */}

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

        {showStart && (
          <DropdownMenuItem onClick={() => setStatus(row.id, "EM_ANDAMENTO")}>
            <Play className="mr-2 h-4 w-4" />
            Iniciar
          </DropdownMenuItem>
        )}

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

        {showFinishNoCharge && (
          <DropdownMenuItem
            onClick={() => {
              onFinalizeNoCharge(row);
            }}
          >
            <Gift className="mr-2 h-4 w-4" />
            Finalizar sem cobrança
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
        
        {/* {showStonePayment && (
          <DropdownMenuItem
            onClick={() => {
              setStoneRow(row);
              setStoneOpen(true);
            }}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Cobrar na maquineta
          </DropdownMenuItem>
        )} */}

        {config?.habilitar_emissao_nfe && showEmissaoDeNota && (
          <DropdownMenuItem
            onClick={() => {
              setEmissaoId(row.id);
              setEmissaoOpen(true);
            }}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Emissão de Nota
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {showResetOS && (
          <DropdownMenuItem onClick={() => onResetOS(row)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reiniciar OS
          </DropdownMenuItem>
        )}

        {showCancelarOS && (
          <DropdownMenuItem onClick={() => onCancelarOS(row)}>
            <X className="mr-2 h-4 w-4" />
            Cancelar OS
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={()=>window.open(`${siteUrl}/print/ordemservico/${row.id}`, '_blank')}>
          <Printer className="mr-2 h-4 w-4"/>
          Imprimir
        </DropdownMenuItem>

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
