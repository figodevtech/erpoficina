import { StatusOS } from "@/app/(app)/(pages)/ordens/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  StatusOS,
  { label: string; className: string }
> = {
  AGUARDANDO_CHECKLIST: {
    label: "Aguardando Checklist",
    className: "bg-gray-500/20 text-warning border-warning/30",
  },
  EM_ANDAMENTO: {
    label: "Em Andamento",
    className: "bg-yellow-500/20 text-info border-info/30",
  },
  ORCAMENTO: {
    label: "Aguardando Orçamento",
    className: "bg-purple-500/20 text-warning border-warning/30",
  },
  APROVACAO_ORCAMENTO: {
    label: "Aprovação Orçamento",
    className: "bg-purple-500/20 text-warning border-warning/30",
  },
  ORCAMENTO_APROVADO: {
    label: "Orçamento Aprovado",
    className: "bg-blue-500/20 text-warning border-warning/30",
  },
  ORCAMENTO_RECUSADO: {
    label: "Orçamento Recusado",
    className: "bg-red-500/20 text-warning border-warning/30",
  },
  PAGAMENTO: {
    label: "Pagamento",
    className: "bg-sky-500/20 text-warning border-warning/30",
  },
  CONCLUIDO: {
    label: "Concluída",
    className: "bg-green-500/20 text-success border-success/30",
  },
  SEM_COBRANCA: {
    label: "Sem Cobrança",
    className: "bg-gray-500/20 text-info border-info/30",
  },
  CANCELADO: {
    label: "Cancelada",
    className: "bg-red-500/20 text-destructive border-destructive/30",
  },
  TODAS: {
    label: "Todas",
    className: "bg-red-500/20 text-destructive border-destructive/30",
  },
  
};

interface StatusBadgeProps {
  status: StatusOS | null | undefined;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
          "bg-muted/50 text-muted-foreground border-border",
          className
        )}
      >
        Sem Status
      </span>
    );
  }

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label.toUpperCase()}
    </span>
  );
}
