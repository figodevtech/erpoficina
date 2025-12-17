export type ServiceOrdersDashboardProps = {
  className?: string;
  insightsEndpoint?: string;
  autoRefreshMs?: number;
};

export type Insights = {
  totalOrders: number;
  ordersOpen: number;
  ordersCompleted: number;
  totalBudget: number;
  avgTicketAll: number;
  avgCompletionHours: number;
  p50CompletionHours: number;
  p90CompletionHours: number;
  ordersToday: number;
  ordersTodayCompleted: number;
  revenueToday: number;
  revenue30d: number;
  countsByStatus: Record<string, number>;
  countsByApproval: Record<string, number>;
  countsByPriority: Record<string, number>;
  monthlyNew: { month: string; count: number }[];
  monthlyCompleted: { month: string; count: number }[];
  monthlyRevenue: { month: string; amount: number }[];
  last7DaysNew: { date: string; count: number }[];
  servicesByUser: {
    usuarioId: string;
    usuarioNome: string;
    usuarioEmail: string;
    totalServicos: number;
  }[];
};
