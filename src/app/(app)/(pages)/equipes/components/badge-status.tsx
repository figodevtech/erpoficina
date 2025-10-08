import { Badge } from "@/components/ui/badge";
import type { StatusOS } from "../types";
import { CheckCircle2, Clock, PackageOpen, PlayCircle, XCircle } from "lucide-react";

interface BadgeStatusProps {
  status: Exclude<StatusOS, "TODAS">;
}

const STATUS_CONF: Record<
  Exclude<StatusOS, "TODAS">,
  { label: string; className: string; Icon: any }
> = {
  ABERTA: {
    label: "Aberta",
    Icon: Clock,
    className: "border-muted-foreground/20 text-muted-foreground bg-muted/50",
  },
  EM_ANDAMENTO: {
    label: "Em Andamento",
    Icon: PlayCircle,
    className: "border-blue-300 text-blue-700 bg-blue-500/10",
  },
  AGUARDANDO_PECA: {
    label: "Aguardando Peça",
    Icon: PackageOpen,
    className: "border-yellow-300 text-yellow-700 bg-yellow-500/10",
  },
  CONCLUIDA: {
    label: "Concluída",
    Icon: CheckCircle2,
    className: "border-green-300 text-green-700 bg-green-500/10",
  },
  CANCELADA: {
    label: "Cancelada",
    Icon: XCircle,
    className: "border-red-300 text-red-700 bg-red-500/10",
  },
};

export function BadgeStatus({ status }: BadgeStatusProps) {
  const { label, className, Icon } = STATUS_CONF[status];
  return (
    <Badge variant="outline" className={`font-medium ${className}`}>
      <Icon className="mr-1 h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
