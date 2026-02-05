import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

type StatusOS =
  | "AGUARDANDO_CHECKLIST"
  | "ORCAMENTO"
  | "ORCAMENTO_RECUSADO"
  | "APROVACAO_ORCAMENTO"
  | "ORCAMENTO_APROVADO"
  | "EM_ANDAMENTO"
  | "PAGAMENTO"
  | "SEM_COBRANCA"
  | "CONCLUIDO"
  | "CANCELADO";

type StatsResponse = {
  counters: Record<StatusOS, number>;
};

export function StatsCards() {
  const [counters, setCounters] = useState<Record<StatusOS, number> | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await axios.get<StatsResponse>("/api/ordens/stats");
        setCounters(data.counters);
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      }
    }
    fetchStats();
  }, []);

  const getCount = (status: StatusOS) => counters?.[status] ?? 0;

  const total = counters
    ? Object.values(counters).reduce((a, b) => a + b, 0)
    : 0;

  const emAndamento = getCount("EM_ANDAMENTO");
  const concluidas = getCount("CONCLUIDO");
  const pendentes =
    getCount("ORCAMENTO_APROVADO") +
    getCount("ORCAMENTO") +
    getCount("APROVACAO_ORCAMENTO") +
    getCount("ORCAMENTO_RECUSADO") +
    getCount("AGUARDANDO_CHECKLIST");

  const stats = [
    {
      label: "Total de OS",
      value: total.toString(),
      icon: ClipboardList,
      description: "Total de ordens registradas",
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
    <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
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
