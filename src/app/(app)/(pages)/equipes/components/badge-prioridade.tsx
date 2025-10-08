import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

interface BadgePrioridadeProps {
  prioridade: "ALTA" | "NORMAL" | "BAIXA";
}

const PRIORITY_CONF = {
  ALTA: {
    label: "Alta",
    Icon: AlertTriangle,
    className: "border-red-700/10 text-red-400 bg-red-700/10 ",
  },
  NORMAL: {
    label: "Normal",
    Icon: AlertCircle,
    className: "border-yellow-500/10 text-yellow-500 bg-yellow-500/10",
  },
  BAIXA: {
    label: "Baixa",
    Icon: CheckCircle2,
    className: "border-green-500/10 text-green-700 bg-green-500/10",
  },
} as const;

export function BadgePrioridade({ prioridade }: BadgePrioridadeProps) {
  const { label, Icon, className } = PRIORITY_CONF[prioridade];
  return (
    <Badge variant="outline" className={`font-medium ${className}`}>
      <Icon className="mr-1 h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
