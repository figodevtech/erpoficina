import { Ordem } from "@/app/(app)/(pages)/ordens/types";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface StatsCardsProps {
  ordens: Ordem[];
}

export function StatsCards({ ordens }: StatsCardsProps) {
  const total = ordens.length;
  const emAndamento = ordens.filter((o) => o.status === "EM_ANDAMENTO").length;
  const concluidas = ordens.filter((o) => o.status === "CONCLUIDO").length;
  const pendentes = ordens.filter(
    (o) => o.status === "ORCAMENTO_APROVADO" || o.status === "ORCAMENTO" || o.status === "APROVACAO_ORCAMENTO" || o.status === "ORCAMENTO_RECUSADO" || o.status === "AGUARDANDO_CHECKLIST"
  ).length;

  const faturamentoTotal = ordens.reduce((acc, o) => acc + o.orcamentototal, 0);

  const stats = [
    {
      label: "Total de OS",
      value: total.toString(),
      icon: ClipboardList,
      description: `R$ ${faturamentoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em orçamentos`,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Em Andamento",
      value: emAndamento.toString(),
      icon: Clock,
      description: "Ordens em execução",
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Concluídas",
      value: concluidas.toString(),
      icon: CheckCircle2,
      description: "Finalizadas com sucesso",
      iconColor: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Pendentes",
      value: pendentes.toString(),
      icon: AlertCircle,
      description: "Aguardando ação",
      iconColor: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
