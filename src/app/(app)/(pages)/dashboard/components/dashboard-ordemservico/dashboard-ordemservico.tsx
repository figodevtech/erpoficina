"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, AreaChart, Area } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  RefreshCcw,
  TrendingUp,
  Activity,
  Timer,
  DollarSign,
  ClipboardList,
  CheckCircle2,
  CircleAlert,
  Calendar as CalendarIcon,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";

/** ============================
 *  Tipos e Constantes
 *  ============================ */
export type ServiceOrdersDashboardProps = {
  className?: string;
  insightsEndpoint?: string;
  autoRefreshMs?: number;
};

type Insights = {
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

/** ============================
 *  Datas / helpers
 *  ============================ */

// intervalo padrão: do primeiro dia do mês atual até hoje
function obterPeriodoInicial() {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
  return { inicio, fim };
}

function formatarDataCurta(d: Date) {
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

// formato que a API espera: YYYY-MM-DD
function formatarDataYYYYMMDD(d: Date) {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/** ============================
 *  Baseline estático (SSR-safe)
 *  ============================ */
const STATIC_ZERO_MONTHS = Array.from({ length: 12 }, (_, i) => {
  const month = String(i + 1).padStart(2, "0");
  return `0000-${month}`;
});

function makeZeroedMonthlyFrom(date: Date, n = 12) {
  const months: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push(ym);
  }
  return months;
}

const MONTH_ABBR = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/** ============================
 *  Hooks de dados
 *  ============================ */
function useInsights(endpoint: string, autoRefreshMs?: number) {
  const [data, setData] = React.useState<Insights | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetcher = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as Insights;
      setData(json);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao carregar insights");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  React.useEffect(() => {
    fetcher();
  }, [fetcher]);

  React.useEffect(() => {
    if (!autoRefreshMs) return;
    const id = setInterval(fetcher, autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, fetcher]);

  return { data, loading, error, refetch: fetcher };
}

/** ============================
 *  Componente principal
 *  ============================ */
export default function ServiceOrdersDashboard({
  className,
  insightsEndpoint = "/api/ordens/insights",
  autoRefreshMs,
}: ServiceOrdersDashboardProps) {
  const periodoInicial = React.useMemo(obterPeriodoInicial, []);
  const [dataInicio, setDataInicio] = React.useState<Date | null>(periodoInicial.inicio);
  const [dataFim, setDataFim] = React.useState<Date | null>(periodoInicial.fim);
  const [filtroAberto, setFiltroAberto] = React.useState(false);

  const endpointComFiltro = React.useMemo(() => {
    if (!dataInicio || !dataFim) return insightsEndpoint;
    const params = new URLSearchParams({
      dateFrom: formatarDataYYYYMMDD(dataInicio),
      dateTo: formatarDataYYYYMMDD(dataFim),
    });
    return `${insightsEndpoint}?${params.toString()}`;
  }, [insightsEndpoint, dataInicio, dataFim]);

  const { data, loading, error, refetch } = useInsights(endpointComFiltro, autoRefreshMs);

  const textoPeriodo =
    dataInicio && dataFim ? `${formatarDataCurta(dataInicio)} - ${formatarDataCurta(dataFim)}` : "Período não definido";

  function tratarDataInicio(date?: Date) {
    if (!date) {
      setDataInicio(null);
      return;
    }
    if (dataFim && date > dataFim) {
      setDataFim(date);
    }
    setDataInicio(date);
  }

  function tratarDataFim(date?: Date) {
    if (!date) {
      setDataFim(null);
      return;
    }
    if (dataInicio && date < dataInicio) {
      setDataInicio(date);
    }
    setDataFim(date);
  }

  function limparFiltros() {
    const p = obterPeriodoInicial();
    setDataInicio(p.inicio);
    setDataFim(p.fim);
  }

  const [zeroMonths, setZeroMonths] = React.useState<string[]>(STATIC_ZERO_MONTHS);

  React.useEffect(() => {
    const now = new Date();
    setZeroMonths(makeZeroedMonthlyFrom(now, 12));
  }, []);

  const formatLabel = React.useCallback((ym: string) => {
    const [yStr, mStr] = ym.split("-");
    const m = Number(mStr);
    if (Number.isFinite(m) && m >= 1 && m <= 12) {
      const monthLabel = MONTH_ABBR[m - 1];
      const shortYear = yStr && /^\d{4}$/.test(yStr) ? yStr.slice(2) : "";
      return shortYear ? `${monthLabel} ${shortYear}` : monthLabel;
    }
    return ym;
  }, []);

  const monthly = React.useMemo(() => {
    const newMap = new Map((data?.monthlyNew ?? []).map((x) => [x.month, x.count]));
    const doneMap = new Map((data?.monthlyCompleted ?? []).map((x) => [x.month, x.count]));
    const revMap = new Map((data?.monthlyRevenue ?? []).map((x) => [x.month, x.amount]));

    const base = zeroMonths.map((m) => ({ month: m, label: formatLabel(m) }));
    return {
      new: base.map(({ month, label }) => ({
        label,
        count: newMap.get(month) ?? 0,
      })),
      done: base.map(({ month, label }) => ({
        label,
        count: doneMap.get(month) ?? 0,
      })),
      rev: base.map(({ month, label }) => ({
        label,
        amount: revMap.get(month) ?? 0,
      })),
    };
  }, [data, zeroMonths, formatLabel]);

  const seriesNewDone = (monthly.new ?? []).map((n, i) => ({
    label: n.label,
    new: n.count,
    done: (monthly.done ?? [])[i]?.count ?? 0,
  }));

  const statusKeys = React.useMemo(() => {
    const keys = Object.keys(data?.countsByStatus ?? {});
    return keys.length ? keys : [];
  }, [data?.countsByStatus]);

  const statusItems = statusKeys.map((name) => ({
    name,
    value: data?.countsByStatus?.[name] ?? 0,
    fill: pickColorForKey(name),
  }));

  const prioEntries = Object.entries(data?.countsByPriority ?? {}).filter(([, v]) => Number(v) > 0);
  const prioItems = prioEntries.map(([key, value]) => ({
    key,
    value: Number(value) || 0,
    color: pickColorForKey(key),
  }));

  const servicesByUser = data?.servicesByUser ?? [];

  const total = data?.totalOrders ?? 0;
  const open = data?.ordersOpen ?? 0;
  const completed = data?.ordersCompleted ?? 0;
  const avgHrs = data?.avgCompletionHours ?? 0;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
            Dashboard de Ordens de Serviço
          </CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span>Visão executiva de produtividade, prazos e receita.</span>
            <Badge variant="default" className="text-[10px] sm:text-xs">
              Período: {textoPeriodo}
            </Badge>
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <SheetOsFiltros
            aberto={filtroAberto}
            aoMudarAberto={setFiltroAberto}
            dataInicio={dataInicio}
            dataFim={dataFim}
            aoMudarDataInicio={tratarDataInicio}
            aoMudarDataFim={tratarDataFim}
            aoLimpar={limparFiltros}
          />
          {autoRefreshMs ? (
            <Badge variant="secondary" className="whitespace-nowrap text-[10px] sm:text-xs">
              Auto · {Math.round((autoRefreshMs ?? 0) / 1000)}s
            </Badge>
          ) : null}
          <Button
            variant="outline"
            size="icon"
            onClick={refetch}
            aria-label="Atualizar dados"
            className={cn("h-8 w-8 sm:h-9 sm:w-9", loading && "cursor-wait opacity-80")}
          >
            <RefreshCcw className={cn("h-3.5 w-3.5", loading && "animate-spin")} aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* KPIs principais */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          <Kpi icon={ClipboardList} label="Total de OS" value={formatNumber(total)} />
          <Kpi icon={Activity} label="OS do dia" value={formatNumber(data?.ordersToday ?? 0)} />
          <Kpi icon={CheckCircle2} label="Concluídas" value={formatNumber(completed)} />
          <Kpi icon={CircleAlert} label="Em andamento" value={formatNumber(open)} />
          <Kpi icon={Timer} label="Tempo médio" value={formatDurationHours(avgHrs)} />
          <Kpi icon={DollarSign} label="Receita (30d)" value={formatCurrencyBRL(data?.revenue30d ?? 0)} />
        </div>

        {/* Erro */}
        {error && !loading && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm">
            Erro ao carregar insights: <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="flex w-full flex-col gap-6 md:grid md:grid-cols-2 xl:grid-cols-3">
          {/* OS por mês */}
          <ChartCard
            title="OS por mês"
            description="Novas vs Concluídas (12m)"
            badge="Tendência"
            badgeIcon={<TrendingUp className="h-3.5 w-3.5" />}
            className="md:col-span-2 xl:col-span-2"
          >
            <ChartContainer
              config={{
                new: { label: "Novas", color: "hsl(var(--chart-1))" },
                done: { label: "Concluídas", color: "hsl(var(--chart-2))" },
              }}
              className="h-48 w-full xs:h-56 sm:h-64 md:h-72 lg:h-80"
            >
              <AreaChart data={seriesNewDone} margin={{ top: 12, right: 12, left: 12, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(43, 127, 255)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="rgb(43, 127, 255)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="areaDone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(255, 210, 0, 0.8)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="rgba(255, 210, 0, 0.8)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tickMargin={8}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tickMargin={8}
                  stroke="hsl(var(--muted-foreground))"
                />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area type="monotone" dataKey="new" stroke="rgb(43, 127, 255)" fill="url(#areaNew)" strokeWidth={2} />
                <Area
                  type="monotone"
                  dataKey="done"
                  stroke="rgba(255, 210, 0, 0.8)"
                  fill="url(#areaDone)"
                  strokeWidth={2}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </ChartCard>

          {/* Ranking de serviços por usuário */}
          <ChartCard
            title="Serviços por usuário"
            description="Ranking de serviços concluídos no período"
            badge="Ranking"
            className="md:col-span-2 xl:col-span-1"
          >
            <ChartContainer
              config={{
                totalServicos: {
                  label: "Serviços",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-60 w-full sm:h-80" // altura melhor preenchida
            >
              <BarChart
                data={servicesByUser}
                margin={{ top: 20, right: -20, left: -20, bottom: 10 }}
                barSize={32} // largura das barras
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="usuarioNome"
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                  tickMargin={10}
                  interval={0}
                  angle={0} // pequena inclinação para caber mais nomes
                  textAnchor="middle"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tickMargin={8}
                  stroke="hsl(var(--muted-foreground))"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="totalServicos"
                  radius={[6, 6, 0, 0]}
                  fill="rgba(43, 127, 255, 0.4)"
                  stroke="rgb(43, 127, 255)"
                  strokeWidth={2}
                >
                  <LabelList dataKey="totalServicos" position="top" className="fill-foreground" fontSize={11} />
                </Bar>
              </BarChart>
            </ChartContainer>
          </ChartCard>

          {/* Status (barras) */}
          <ChartCard title="OS por status" description="Distribuição atual" badge="Barras" className="md:col-span-2">
            <ChartContainer
              config={{
                value: {
                  label: "Quantidade de Ordens",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[280px]"
            >
              <BarChart data={statusItems} margin={{ top: 20, right: 12, left: 12, bottom: 12 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tickMargin={8}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tickMargin={8}
                  stroke="hsl(var(--muted-foreground))"
                />
                <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusItems.map((s) => (
                    <Cell key={s.name} fill="rgba(43, 127, 255, 0.3)" stroke="rgb(43, 127, 255)" strokeWidth={2} />
                  ))}
                  <LabelList stroke="none" dataKey="value" position="top" className="fill-foreground" fontSize={12} />
                </Bar>
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </ChartCard>

          {/* Prioridade (pizza) */}
          <ChartCard
            title="Prioridade das OS"
            description="Carga por nível"
            badge="Pizza"
            className="md:col-span-2 xl:col-span-1"
          >
            <ChartContainer
              config={Object.fromEntries(prioItems.map((p) => [p.key, { label: p.key, color: p.color }]))}
              className="h-[280px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={prioItems}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  strokeWidth={2}
                  className="xs:innerRadius-[48] xs:outerRadius-[80] sm:innerRadius-[60] sm:outerRadius-[95]"
                >
                  {prioItems.map((p) => (
                    <Cell key={p.key} fill="rgba(43, 127, 255, 0.3)" stroke="rgb(43, 127, 255)" />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="outside"
                    className="fill-foreground"
                    fontSize={12}
                    stroke="none"
                    formatter={(label: React.ReactNode) => {
                      const v = Number(label ?? 0);
                      return v > 0 ? String(v) : "";
                    }}
                  />
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="key" />} />
              </PieChart>
            </ChartContainer>
          </ChartCard>
        </div>

        {!loading && !error && total === 0 && <EmptyState />}
      </CardContent>
    </Card>
  );
}

/** ============================
 *  Sheet de filtros (datas)
 *  ============================ */
type PropriedadesSheetOsFiltros = {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  dataInicio: Date | null;
  dataFim: Date | null;
  aoMudarDataInicio: (data?: Date) => void;
  aoMudarDataFim: (data?: Date) => void;
  aoLimpar: () => void;
};

function SheetOsFiltros({
  aberto,
  aoMudarAberto,
  dataInicio,
  dataFim,
  aoMudarDataInicio,
  aoMudarDataFim,
  aoLimpar,
}: PropriedadesSheetOsFiltros) {
  return (
    <Sheet open={aberto} onOpenChange={aoMudarAberto}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 hover:cursor-pointer">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtros de ordens de serviço</SheetTitle>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Intervalo de datas</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 space-y-1">
                <p className="text-[11px] text-muted-foreground">Data inicial</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-9 w-full justify-start text-left text-xs font-normal",
                        !dataInicio && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1.5 h-4 w-4" />
                      {dataInicio ? formatarDataCurta(dataInicio) : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataInicio ?? undefined}
                      onSelect={aoMudarDataInicio}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-[11px] text-muted-foreground">Data final</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-9 w-full justify-start text-left text-xs font-normal",
                        !dataFim && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1.5 h-4 w-4" />
                      {dataFim ? formatarDataCurta(dataFim) : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataFim ?? undefined}
                      onSelect={aoMudarDataFim}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-2 flex justify-between gap-2">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={aoLimpar}>
            Limpar filtros
          </Button>
          <SheetClose asChild>
            <Button type="button" className="w-full sm:w-auto">
              Aplicar filtros
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/** ============================
 *  Sub-componentes
 *  ============================ */
interface ChartCardProps {
  title: string;
  description?: string;
  badge?: string;
  badgeIcon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

function ChartCard({ title, description, badge, badgeIcon, className, children }: ChartCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {badge && (
          <Badge variant="outline" className="gap-1 whitespace-nowrap">
            {badgeIcon}
            {badge}
          </Badge>
        )}
      </div>
      {children}
    </div>
  );
}

interface KpiProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

function Kpi({ label, value, icon: Icon, className }: KpiProps) {
  return (
    <div className={cn("rounded-lg border p-3", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> : null}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      role="status"
      className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border p-6 text-center text-sm text-muted-foreground"
    >
      Nenhuma OS encontrada ainda. Crie ordens para ver os gráficos aqui.
    </div>
  );
}

/** ============================
 *  Utilidades de formatação
 *  ============================ */
function formatNumber(n: number) {
  return new Intl.NumberFormat("pt-BR").format(n || 0);
}

function formatCurrencyBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(v || 0);
}

function formatDurationHours(h: number) {
  if (!h || h <= 0) return "—";
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  if (hours < 24) return `${hours}h ${minutes}m`;
  const days = Math.floor(hours / 24);
  const remH = hours % 24;
  return `${days}d ${remH}h`;
}

/** ============================
 *  Helpers de cores
 *  ============================ */
const PALETTE = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6, var(--chart-1)))",
];

function pickColorForKey(key: string) {
  const i = Math.abs(hashCode(key)) % PALETTE.length;
  return PALETTE[i];
}

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}
