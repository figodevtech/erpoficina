"use client";

import * as React from "react";
import clsx from "clsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  AreaChart,
  Area,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { RefreshCcw, Users, TrendingUp, Activity, MapPin } from "lucide-react";

/** ============================
 *  Tipos e Constantes
 *  ============================ */
export type CustomersDashboardProps = {
  className?: string;
  insightsEndpoint?: string; // default: "/api/customers/insights"
  statusEndpoint?: string; // default: "/api/customers/status-counter"
  autoRefreshMs?: number;
};

type StatusKey = "ATIVO" | "INATIVO" | "PENDENTE" | "NULL";

type InsightsResponse = {
  totalClients: number;
  countsByStatus: Record<string, number>;
  countsByTipo: { FISICA: number; JURIDICA: number };
  byEstado: Record<string, number>;
  topCidades: { cidade: string; count: number }[];
  monthlyNew: { month: string; count: number }[]; // month = YYYY-MM
  recent30d: number;
  prev30d: number;
};

const STATUS_ORDER: StatusKey[] = ["ATIVO", "PENDENTE", "INATIVO"];
const STATUS_LABEL: Record<StatusKey, string> = {
  ATIVO: "Ativos",
  PENDENTE: "Pendentes",
  INATIVO: "Inativos",
  NULL: "Sem status",
};
const STATUS_COLOR: Record<StatusKey, string> = {
  ATIVO: "hsl(var(--chart-1))",
  PENDENTE: "hsl(var(--chart-2))",
  INATIVO: "hsl(var(--chart-3))",
  NULL: "hsl(var(--muted-foreground))",
};

/** contraste preto no light / branco no dark (usado para barras e legendas) */
const CONTRAST_TEXT = "text-black dark:text-white";

/** ============================
 *  Hooks de dados
 *  ============================ */
function useInsights(endpoint: string, autoRefreshMs?: number) {
  const [data, setData] = React.useState<InsightsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetcher = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as InsightsResponse;
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

function useStatusCounter(endpoint: string, autoRefreshMs?: number) {
  type StatusCounterResponse = {
    countsByStatus: Record<string, number>;
    totalClients: number;
  };

  const [data, setData] = React.useState<StatusCounterResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<null | string>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as StatusCounterResponse;
      setData(json);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao carregar");
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    if (!autoRefreshMs) return;
    const id = setInterval(fetchData, autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

/** ============================
 *  Dashboard principal
 *  ============================ */
export default function CustomersDashboard({
  className,
  insightsEndpoint = "/api/customers/insights",
  statusEndpoint = "/api/customers/status-counter",
  autoRefreshMs,
}: CustomersDashboardProps) {
  const {
    data: insights,
    loading,
    error,
    refetch,
  } = useInsights(insightsEndpoint, autoRefreshMs);

  // Derivados
  const total = insights?.totalClients ?? 0;
  const ativos = insights?.countsByStatus?.["ATIVO"] ?? 0;
  const ativosPct = percentOf(ativos, total);
  const novos30 = insights?.recent30d ?? 0;
  const prev30 = insights?.prev30d ?? 0;
  const crescimento30 = growthRate(novos30, prev30); // em %
  const ufsAtendidas = Object.keys(insights?.byEstado ?? {}).length;
  const topCidades = insights?.topCidades ?? [];

  const tipoData = [
    {
      key: "FISICA",
      name: "Pessoa Física",
      value: insights?.countsByTipo?.FISICA ?? 0,
    },
    {
      key: "JURIDICA",
      name: "Pessoa Jurídica",
      value: insights?.countsByTipo?.JURIDICA ?? 0,
    },
  ];

  const monthly = (insights?.monthlyNew ?? []).map((m) => ({
    ...m,
    label: formatMonthLabel(m.month),
  }));

  return (
    <Card className={clsx("w-full", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Dashboard de Clientes
          </CardTitle>
          <CardDescription>
            Visão geral de quantidade e distribuição de clientes, com tendências
            (últimos 12 meses).
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {autoRefreshMs ? (
            <Badge variant="secondary" className="whitespace-nowrap">
              Auto · {Math.round((autoRefreshMs ?? 0) / 1000)}s
            </Badge>
          ) : null}
          <Button
            variant="outline"
            size="icon"
            onClick={refetch}
            aria-label="Atualizar"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* KPIs principais */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          <Kpi label="Total" value={total} icon={Users} />
          <Kpi label="Novos (Últimos 30d)" value={novos30} icon={Activity} />
          <Kpi label="Crescimento (Últimos 30d)" value={`${crescimento30}%`} />
          <Kpi label="% Ativos" value={`${ativosPct}%`} />
          <Kpi label="UFs atendidas" value={ufsAtendidas} icon={MapPin} />
          <Kpi label="Cidades (top)" value={Math.min(10, topCidades.length)} />
        </div>

        {/* Loading / erro */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <SkeletonChart />
            <SkeletonChart />
            <SkeletonChart />
          </div>
        )}
        {error && !loading && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm">
            Erro ao carregar insights:{" "}
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Conteúdo principal */}
        {!loading &&
          !error &&
          (total === 0 ? (
            <EmptyState />
          ) : (
            <div className="gap-6 w-full flex flex-col md:grid md:grid-cols-2 xl:grid-cols-3">
              {/* Tendência 12 meses */}
              <div className="rounded-xl border bg-card p-4 md:col-span-2 xl:col-span-3">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Novos clientes por mês
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Últimos 12 meses
                    </p>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> Tendência
                  </Badge>
                </div>
                <ChartContainer
                  config={{
                    count: {
                      label: "Novos clientes",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[280px] w-full text-primary dark:text-primary" // << força cor a herdar (preto/light, branco/dark)
                >
                  <AreaChart
                    data={monthly}
                    margin={{ top: 12, right: 12, left: 12, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="80%"
                          stopColor="currentColor"
                          stopOpacity={0.3}
                        />{" "}
                        {/* << */}
                        <stop
                          offset="95%"
                          stopColor="currentColor"
                          stopOpacity={0}
                        />{" "}
                        {/* << */}
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
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
                    <ChartTooltip
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="currentColor" // << traço preto/light, branco/dark
                      fill="url(#areaFill)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>

              {/* Top UFs */}
              <div className="rounded-xl border bg-card p-4 col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Top UFs por clientes</p>
                    <p className="text-xs text-muted-foreground">
                      Estados com mais clientes
                    </p>
                  </div>
                  <Badge variant="outline">Barras</Badge>
                </div>
                <ChartContainer
                  config={{
                    count: {
                      label: "Clientes",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                    className="h-[280px] text-primary/30 not-dark:text-primary" // barras e textos em preto/branco
                >
                  <BarChart
                    data={topUFs(insights?.byEstado ?? {}, 8)}
                    margin={{ top: 20, right: 12, left: 12, bottom: 12 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="uf"
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
                    <ChartTooltip
                      content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar
                      dataKey="count"
                      stroke="oklch(0.623 0.214 259.815)"
                      strokeWidth={2}
                      fill="currentColor" // << barras na cor primary
                      radius={[6, 6, 0, 0]}
                    >
                      <LabelList
                        dataKey="count"
                        position="top"
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>

              {/* Tipo de pessoa */}
              <div className="rounded-xl border bg-card p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Tipo de pessoa</p>
                    <p className="text-xs text-muted-foreground">
                      Física vs Jurídica
                    </p>
                  </div>
                  <Badge variant="outline">Pizza</Badge>
                </div>
                <ChartContainer
                  config={{
                    FISICA: {
                      label: "Pessoa Física",
                      color: "hsl(var(--chart-4))",
                    },
                    JURIDICA: {
                      label: "Pessoa Jurídica",
                      color: "hsl(var(--chart-5))",
                    },
                  }}
                  className="h-[280px] text-primary dark:text-primary/30"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={tipoData}
                      dataKey="value"
                      nameKey="key"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      strokeWidth={2}
                    >
                      {tipoData.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={"currentColor"} // << usa cor primária
                          stroke="oklch(0.623 0.214 259.815)"
                        />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="outside"
                        className="fill-foreground"
                        fontSize={12}
                        formatter={(value: number) => (value > 0 ? value : "")}
                      />
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="key" />}
                      className={clsx(
                        "-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                        
                      )}
                    />
                  </PieChart>
                </ChartContainer>
              </div>

              {/* Status (card) */}
              <div className="xl:col-span-3">
                <CustomersStatusCard
                  className="w-full"
                  endpoint={statusEndpoint}
                />
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

/** ============================
 *  Card de Status (reutilizável)
 *  ============================ */
export type CustomersStatusCardProps = {
  className?: string;
  endpoint?: string;
  autoRefreshMs?: number;
};

export function CustomersStatusCard({
  className,
  endpoint = "/api/customers/status-counter",
  autoRefreshMs,
}: CustomersStatusCardProps) {
  const { data, isLoading, error, refetch } = useStatusCounter(
    endpoint,
    autoRefreshMs
  );

  const total = data?.totalClients ?? 0;
  const counts = data?.countsByStatus ?? {
    ATIVO: 0,
    INATIVO: 0,
    PENDENTE: 0,
  };

  const series = STATUS_ORDER.map((key) => ({
    key,
    name: STATUS_LABEL[key],
    value: (counts as any)[key] ?? 0,
    fill: STATUS_COLOR[key],
  })).filter((s) => s.value > 0 || keyIsKnown(s.key));

  const empty = total === 0;

  return (
    <Card className={clsx("w-full", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Clientes por status
          </CardTitle>
          <CardDescription>
            Distribuição de clientes por <em>status</em> (ATIVO, PENDENTE,
            INATIVO).
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {autoRefreshMs ? (
            <Badge variant="secondary" className="whitespace-nowrap">
              Auto · {Math.round((autoRefreshMs ?? 0) / 1000)}s
            </Badge>
          ) : null}
          <Button
            variant="outline"
            size="icon"
            onClick={refetch}
            aria-label="Atualizar"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Kpi label="Total" value={total} icon={Users} />
          <Kpi
            label="Ativos"
            value={(counts as any)["ATIVO"] ?? 0}
            tint="ATIVO"
          />
          <Kpi
            label="Pendentes"
            value={(counts as any)["PENDENTE"] ?? 0}
            tint="PENDENTE"
          />
          <Kpi
            label="Inativos"
            value={(counts as any)["INATIVO"] ?? 0}
            tint="INATIVO"
          />
        </div>

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm">
            Erro ao carregar dados: <span className="font-medium">{error}</span>
          </div>
        )}

        {!isLoading &&
          !error &&
          (empty ? (
            <EmptyState />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Status distribution Pie Chart */}
              <div className="rounded-xl border bg-card p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Distribuição (%)</p>
                    <p className="text-xs text-muted-foreground">
                      Por status de cliente
                    </p>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> Pizza
                  </Badge>
                </div>
                <ChartContainer
                  config={{
                    ATIVO: {
                      label: STATUS_LABEL.ATIVO,
                      color: STATUS_COLOR.ATIVO,
                    },
                    PENDENTE: {
                      label: STATUS_LABEL.PENDENTE,
                      color: STATUS_COLOR.PENDENTE,
                    },
                    INATIVO: {
                      label: STATUS_LABEL.INATIVO,
                      color: STATUS_COLOR.INATIVO,
                    },
                  }}
                  className="h-[280px] text-primary dark:text-primary/30"
                >
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          hideLabel
                          formatter={(value) => {
                            const pct = percentOf(Number(value), total);
                            return `${value} (${pct}%)`;
                          }}
                        />
                      }
                    />
                    <Pie
                      data={series}
                      dataKey="value"
                      nameKey="key"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      strokeWidth={2}
                    >
                      {series.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={"currentColor"} // << usa cor primária
                          stroke="oklch(0.623 0.214 259.815)"
                        />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="outside"
                        className="fill-foreground"
                        fontSize={12}
                        formatter={(value: number) => {
                          const pct = percentOf(value, total);
                          return `${pct}%`;
                        }}
                      />
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="key" />}
                      className={CONTRAST_TEXT}
                    />
                  </PieChart>
                </ChartContainer>
              </div>

            </div>
          ))}
      </CardContent>
    </Card>
  );
}

/** ============================
 *  Sub-componentes e utils
 *  ============================ */
function Kpi({
  label,
  value,
  icon: Icon,
  tint,
}: {
  label: string;
  value: number | string;
  icon?: React.ComponentType<{ className?: string }>;
  tint?: StatusKey;
}) {
  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {typeof tint !== "undefined" && (
        <div
          className="mt-2 h-1.5 w-full rounded-full"
          style={{ background: STATUS_COLOR[tint] }}
          aria-hidden
        />
      )}
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="rounded-xl border p-3">
      <div className="mb-2 h-4 w-40 animate-pulse rounded bg-muted" />
      <div className="h-[240px] animate-pulse rounded bg-muted/60" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border p-6 text-center text-sm text-muted-foreground">
      Nenhum cliente encontrado ainda. Cadastre clientes para ver os gráficos
      aqui.
    </div>
  );
}

/** Utils */
function keyIsKnown(key: StatusKey) {
  return key === "ATIVO" || key === "INATIVO" || key === "PENDENTE";
}
function percentOf(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}
function growthRate(curr: number, prev: number) {
  if (!prev && !curr) return 0;
  if (!prev) return 100;
  return Math.round(((curr - prev) / prev) * 100);
}
function formatMonthLabel(ym: string) {
  // ym esperado no formato YYYY-MM
  const [yStr = "", mStr = ""] = ym.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  // Garante índice de mês válido (0-11)
  const monthIndex = Number.isFinite(m) && m >= 1 && m <= 12 ? m - 1 : 0;
  const yearNum = Number.isFinite(y) ? y : new Date().getFullYear();
  const d = new Date(yearNum, monthIndex, 1);
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}
function topUFs(byUF: Record<string, number>, limit = 8) {
  return Object.entries(byUF)
    .map(([uf, count]) => ({ uf, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
