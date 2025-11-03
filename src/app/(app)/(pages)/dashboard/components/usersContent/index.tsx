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
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import type { TooltipProps } from "recharts";
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
  const tipoColors = ["hsl(var(--chart-4))", "hsl(var(--chart-5))"];

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
              <div className="rounded-xl border p-3 md:col-span-2 xl:col-span-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Novos clientes por mês (12m)
                  </p>
                  <Badge variant="outline" className="gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> Tendência
                  </Badge>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={monthly}
                      margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="areaFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--chart-1))"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--chart-1))"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        fontSize={12}
                      />
                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        fontSize={12}
                      />
                      <Tooltip content={<ChartTooltipSimple />} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--chart-1))"
                        fill="url(#areaFill)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top UFs */}
              <div className="rounded-xl border p-3 col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Top UFs por clientes</p>
                  <Badge variant="outline">Barras</Badge>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topUFs(insights?.byEstado ?? {}, 8)}
                      margin={{ top: 32, right: 12, left: 8, bottom: 8 }} // <- era top: 8
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="uf"
                        axisLine={false}
                        tickLine={false}
                        fontSize={12}
                      />
                      <YAxis
  allowDecimals={false}
  axisLine={false}
  tickLine={false}
  fontSize={12}
  domain={[0, (dataMax: number) => dataMax + Math.max(2, Math.round(dataMax * 0.1))]}
/>
                      <Tooltip content={<ChartTooltipSimple />} />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        <LabelList dataKey="count" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tipo de pessoa */}
              <div className="rounded-xl border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Tipo de pessoa</p>
                  <Badge variant="outline">Pizza</Badge>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tipoData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {tipoData.map((entry, i) => (
                          <Cell
                            key={String(entry.key)}
                            fill={tipoColors[i % tipoColors.length]}
                          />
                        ))}
                        <LabelList dataKey="value" position="outside" />
                      </Pie>
                      <Legend />
                      <Tooltip content={<ChartTooltipSimple />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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
  const percent = (v: number) => (total ? Math.round((v / total) * 100) : 0);

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
              <div className="rounded-xl border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Distribuição (%)</p>
                  <Badge variant="outline" className="gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> Pizza
                  </Badge>
                </div>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={series}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {series.map((entry) => (
                          <Cell key={entry.key} fill={entry.fill} />
                        ))}
                        <LabelList
                          dataKey="value"
                          position="outside"
                          formatter={(value: any) =>
                            `${percent(Number(value))}%`
                          }
                        />
                      </Pie>
                      <Tooltip content={<ChartTooltip total={total} />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <LegendInline series={series as any} total={total} />
              </div>

              <div className="rounded-xl border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Contagem por status</p>
                  <Badge variant="outline">Barras</Badge>
                </div>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={series as any}
                      margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        fontSize={12}
                      />
                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        fontSize={12}
                      />
                      <Tooltip content={<ChartTooltip total={total} />} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {(series as any).map((entry: any) => (
                          <Cell key={entry.key} fill={entry.fill} />
                        ))}
                        <LabelList
                          dataKey="value"
                          position="top"
                          formatter={(v: any) => String(v)}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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

function ChartTooltip(props: TooltipProps<number, string> & { total: number }) {
  const { active, payload, total } = props as any;
  if (!active || !payload || !payload.length) return null;
  const item = (payload?.[0]?.payload ?? {}) as any;
  const pct = total ? Math.round(((item?.value ?? 0) / total) * 100) : 0;
  return (
    <div className="rounded-md border bg-background/95 p-2 text-xs shadow">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded"
            style={{ background: item?.fill }}
          />
          <span className="font-medium">{item?.name}</span>
        </div>
        <div>
          <span className="font-mono">{item?.value ?? 0}</span>
          <span className="text-muted-foreground"> · {pct}%</span>
        </div>
      </div>
    </div>
  );
}

function ChartTooltipSimple(props: TooltipProps<number, string>) {
  const { active, payload, label } = props as any;
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-md border bg-background/95 p-2 text-xs shadow">
      <div className="font-medium">{label}</div>
      <div className="font-mono">{p?.value ?? 0}</div>
    </div>
  );
}

function LegendInline({
  series,
  total,
}: {
  series: { key: StatusKey; name: string; value: number; fill: string }[];
  total: number;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      {series.map((s) => (
        <div key={s.key} className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded"
            style={{ background: s.fill }}
            aria-hidden
          />
          <span className="text-muted-foreground">{s.name}</span>
          <span className="font-medium">{percentOf(s.value, total)}%</span>
        </div>
      ))}
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
