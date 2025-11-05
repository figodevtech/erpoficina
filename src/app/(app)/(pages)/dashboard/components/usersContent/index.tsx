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

export type CustomersDashboardProps = {
  className?: string;
  insightsEndpoint?: string;
  statusEndpoint?: string;
  autoRefreshMs?: number;
};

type StatusKey = "ATIVO" | "INATIVO" | "PENDENTE" | "NULL";

type InsightsResponse = {
  totalClients: number;
  countsByStatus: Record<string, number>;
  countsByTipo: { FISICA: number; JURIDICA: number };
  byEstado: Record<string, number>;
  topCidades: { cidade: string; count: number }[];
  monthlyNew: { month: string; count: number }[];
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

// -------------------- BASELINES ZERADOS --------------------
// 12 meses anteriores no formato YYYY-MM
function makeZeroedMonthly(n = 12) {
  const now = new Date();
  const months: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    months.push(ym);
  }
  return months;
}

const ZERO_MONTHS = makeZeroedMonthly(12);

const INITIAL_INSIGHTS: InsightsResponse = {
  totalClients: 0,
  countsByStatus: { ATIVO: 0, INATIVO: 0, PENDENTE: 0 },
  countsByTipo: { FISICA: 0, JURIDICA: 0 },
  byEstado: {},
  topCidades: [],
  monthlyNew: ZERO_MONTHS.map((m) => ({ month: m, count: 0 })),
  recent30d: 0,
  prev30d: 0,
};

const DEFAULT_UF_BARS = [
  { uf: "SP", count: 0 },
  { uf: "RJ", count: 0 },
  { uf: "MG", count: 0 },
  { uf: "BA", count: 0 },
  { uf: "RS", count: 0 },
];

const INITIAL_STATUS_COUNTER = {
  countsByStatus: { ATIVO: 0, INATIVO: 0, PENDENTE: 0 },
  totalClients: 0,
};

// -------------------- TWEEN / ANIMAÇÃO SUAVE --------------------
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Anima uma lista de números do estado atual até o alvo, com RAF.
 * Mantém tamanho da lista; se o alvo mudar de tamanho, faz pad de zeros.
 */
function useTweenedList(
  target: number[],
  {
    duration = 700,
    easing = easeOutCubic,
    key,
  }: {
    duration?: number;
    easing?: (t: number) => number;
    key?: React.DependencyList | any;
  } = {}
) {
  const [values, setValues] = React.useState<number[]>(() =>
    target.map(() => 0)
  );
  const fromRef = React.useRef<number[]>(values);

  React.useEffect(() => {
    const from = fromRef.current;
    const toLen = target.length;
    const fromLen = from.length;
    const fromPadded =
      fromLen === toLen
        ? from.slice()
        : Array.from({ length: toLen }, (_, i) => from[i] ?? 0);
    const to = target.slice();

    let raf = 0;
    const start = performance.now();

    const tick = () => {
      const now = performance.now();
      const t = Math.min(1, (now - start) / duration);
      const e = easing(t);
      const curr = to.map((v, i) => fromPadded[i] + (v - fromPadded[i]) * e);
      setValues(curr);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = curr;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(target), duration, ...(Array.isArray(key) ? key : [key])]);

  return values;
}

// ----------------------------------------------------------

function useInsights(endpoint: string, autoRefreshMs?: number) {
  // >>> manter conforme solicitado <<<
  const [data, setData] = React.useState<InsightsResponse | undefined>(
    undefined
  );
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
      setData(INITIAL_INSIGHTS);
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

  const [data, setData] = React.useState<StatusCounterResponse>(
    INITIAL_STATUS_COUNTER
  );
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
      setData(INITIAL_STATUS_COUNTER);
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

  // usa fallback seguro enquanto insights é undefined
  const i = insights ?? INITIAL_INSIGHTS;

  const total = i.totalClients;
  const ativos = i.countsByStatus?.["ATIVO"] ?? 0;
  const ativosPct = percentOf(ativos, total);
  const novos30 = i.recent30d;
  const prev30 = i.prev30d;
  const crescimento30 = growthRate(novos30, prev30);
  const ufsAtendidas = Object.keys(i.byEstado ?? {}).length;
  const topCidades = i.topCidades ?? [];

  const tipoData = [
    {
      key: "FISICA",
      name: "Pessoa Física",
      value: i.countsByTipo?.FISICA ?? 0,
    },
    {
      key: "JURIDICA",
      name: "Pessoa Jurídica",
      value: i.countsByTipo?.JURIDICA ?? 0,
    },
  ];

  // Sem buracos: sempre 12 meses (usa ZERO_MONTHS e mapeia o retorno por chave)
  const monthlyBase = React.useMemo(() => {
    const map = new Map((i.monthlyNew ?? []).map((m) => [m.month, m.count]));
    return ZERO_MONTHS.map((m) => ({
      month: m,
      label: formatMonthLabel(m),
      count: map.get(m) ?? 0,
    }));
  }, [i.monthlyNew]);

  // Mantém comprimento estável (12) para animar bem
  const monthlyCountsTarget = monthlyBase.map((m) => m.count);
  const monthlyCountsTween = useTweenedList(monthlyCountsTarget, {
    duration: 800,
    key: [i.recent30d, i.prev30d],
  });
  const monthly = monthlyBase.map((m, iIdx) => ({
    ...m,
    count: Math.round(monthlyCountsTween[iIdx] ?? 0),
  }));

  const ufsDataRaw = topUFs(i.byEstado ?? {}, 8);
  const ufsDataStable = ufsDataRaw.length ? ufsDataRaw : DEFAULT_UF_BARS;
  const ufsCountsTarget = ufsDataStable.map((u) => u.count);
  const ufsCountsTween = useTweenedList(ufsCountsTarget, {
    duration: 700,
    key: [ufsDataStable.length],
  });
  const ufsData = ufsDataStable.map((u, iIdx) => ({
    ...u,
    count: Math.round(ufsCountsTween[iIdx] ?? 0),
  }));

  const tipoCountsTarget = tipoData.map((t) => t.value);
  const tipoCountsTween = useTweenedList(tipoCountsTarget, { duration: 600 });
  const tipoAnimated = tipoData.map((t, iIdx) => ({
    ...t,
    value: Math.max(0, Math.round(tipoCountsTween[iIdx] ?? 0)),
  }));

  return (
    <Card className={clsx("w-full", className)}>
      <CardHeader className="flex flex-col gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-0.5 sm:space-y-1">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" /> Dashboard de Clientes
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Visão geral de quantidade e distribuição de clientes, com tendências
            (últimos 12 meses).
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {autoRefreshMs ? (
            <Badge variant="secondary" className="whitespace-nowrap text-xs">
              Auto · {Math.round((autoRefreshMs ?? 0) / 1000)}s
            </Badge>
          ) : null}
          <Button
            variant="outline"
            size="icon"
            onClick={refetch}
            aria-label="Atualizar"
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 bg-transparent"
          >
            <RefreshCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-3 sm:space-y-5 sm:px-4 md:space-y-6">
        <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-6 sm:gap-3 md:gap-4">
          <Kpi label="Total" value={total} icon={Users} />
          <Kpi label="Novos (30d)" value={novos30} icon={Activity} />
          <Kpi label="Crescimento (30d)" value={`${crescimento30}%`} />
          <Kpi label="% Ativos" value={`${ativosPct}%`} />
          <Kpi label="UFs atendidas" value={ufsAtendidas} icon={MapPin} />
          <Kpi label="Top Cidades" value={Math.min(10, topCidades.length)} />
        </div>

        {error && !loading && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-xs sm:p-3 sm:text-sm">
            Erro ao carregar insights:{" "}
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Sempre renderiza os gráficos; anima com tween ao atualizar */}
        <div
          className={clsx(
            "grid w-full grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3",
            loading && "opacity-80"
          )}
        >
          {/* Área - Novos por mês */}
          <div className="rounded-xl border bg-card p-2 sm:p-3 md:p-4 lg:col-span-3">
            <div className="mb-2 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium sm:text-sm">
                  Novos clientes por mês
                </p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Últimos 12 meses
                </p>
              </div>
              <Badge variant="outline" className="w-fit gap-1 text-xs">
                <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Tendência
              </Badge>
            </div>
            <ChartContainer
              config={{
                count: {
                  label: "Novos clientes",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-48 w-full text-primary dark:text-primary xs:h-56 sm:h-64 md:h-72 lg:h-80"
            >
              <AreaChart
                data={monthly}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="80%"
                      stopColor="currentColor"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="currentColor"
                      stopOpacity={0}
                    />
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
                  tickMargin={4}
                  stroke="hsl(var(--muted-foreground))"
                  className="text-xs sm:text-sm"
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tickMargin={8}
                  stroke="hsl(var(--muted-foreground))"
                  className="text-xs sm:text-sm"
                  domain={[0, "dataMax + 1"]}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="currentColor"
                  fill="url(#areaFill)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ChartContainer>
          </div>

          {/* Barras - UFs */}
          <div className="rounded-xl border bg-card p-2 sm:p-3 md:p-4 lg:col-span-2">
            <div className="mb-2 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium sm:text-sm">
                  Top UFs por clientes
                </p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Estados com mais clientes
                </p>
              </div>
              <Badge variant="outline" className="w-fit text-xs">
                Barras
              </Badge>
            </div>
            <ChartContainer
              config={{
                count: { label: "Clientes", color: "hsl(var(--chart-2))" },
              }}
              className="h-48 text-primary/30 not-dark:text-primary xs:h-56 sm:h-64 md:h-72"
            >
              <BarChart
                data={ufsData}
                margin={{ top: 16, right: 8, left: -12, bottom: 8 }}
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
                  fontSize={11}
                  tickMargin={4}
                  stroke="hsl(var(--muted-foreground))"
                  className="text-xs sm:text-sm"
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                  tickMargin={8}
                  stroke="hsl(var(--muted-foreground))"
                  className="text-xs sm:text-sm"
                  domain={[0, "dataMax + 1"]}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar
                  dataKey="count"
                  stroke="oklch(0.623 0.214 259.815)"
                  strokeWidth={2}
                  fill="currentColor"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="count"
                    position="top"
                    className="fill-foreground"
                    fontSize={10}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>

          {/* Pizza - Tipo de pessoa */}
          <div className="rounded-xl border bg-card p-2 sm:p-3 md:p-4 lg:col-span-1">
            <div className="mb-2 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium sm:text-sm">Tipo de pessoa</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Física vs Jurídica
                </p>
              </div>
              <Badge variant="outline" className="w-fit text-xs">
                Pizza
              </Badge>
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
              className="h-48 text-primary/30 xs:h-56 sm:h-64 md:h-72"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={tipoAnimated}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  strokeWidth={2}
                  isAnimationActive={false}
                  className="xs:innerRadius-[48] xs:outerRadius-[80] sm:innerRadius-[60] sm:outerRadius-[95]"
                >
                  {tipoAnimated.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={"currentColor"}
                      stroke="oklch(0.623 0.214 259.815)"
                    />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="outside"
                    fontSize={12}
                    fill="white"
                    stroke="none"
                    formatter={(value: number) => (value > 0 ? value : "")}
                    className="fill-foreground"
                  />
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="key" />}
                  className={clsx(
                    "-translate-y-2 flex-wrap gap-2 text-xs [&>*]:basis-1/2 [&>*]:justify-center text-white not-dark:text-black sm:[&>*]:basis-1/4"
                  )}
                />
              </PieChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

  const total = data.totalClients;
  const counts = data.countsByStatus ?? { ATIVO: 0, INATIVO: 0, PENDENTE: 0 };

  const series = (STATUS_ORDER.concat(["NULL"]) as StatusKey[])
    .map((key) => ({
      key,
      name: STATUS_LABEL[key],
      value: (counts as any)[key] ?? 0,
      fill: STATUS_COLOR[key],
    }))
    .filter((s) => s.value > 0 || keyIsKnown(s.key));

  // TWEEN também no gráfico de status
  const seriesTarget = series.map((s) => s.value);
  const seriesTween = useTweenedList(seriesTarget, { duration: 600 });
  const seriesAnimated = series.map((s, i) => ({
    ...s,
    value: Math.round(seriesTween[i] ?? 0),
  }));

  const allZero = seriesAnimated.every((s) => s.value === 0);

  return (
    <Card className={clsx("w-full", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 px-3 py-3 sm:px-4 sm:py-4">
        <div>
          <CardTitle className="text-base sm:text-lg">
            Status dos Clientes
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Distribuição por status
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {autoRefreshMs ? (
            <Badge variant="secondary" className="whitespace-nowrap text-xs">
              Auto · {Math.round((autoRefreshMs ?? 0) / 1000)}s
            </Badge>
          ) : null}
          <Button
            variant="outline"
            size="icon"
            onClick={refetch}
            aria-label="Atualizar"
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <RefreshCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
        {error && !isLoading && (
          <div className="mb-3 rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-xs sm:p-3 sm:text-sm">
            Erro ao carregar: <span className="font-medium">{error}</span>
          </div>
        )}

        <div
          className={clsx(
            "grid grid-cols-1 gap-3 sm:grid-cols-2",
            isLoading && "opacity-80"
          )}
        >
          <ChartContainer
            config={{
              ATIVO: {
                label: STATUS_LABEL["ATIVO"],
                color: STATUS_COLOR["ATIVO"],
              },
              PENDENTE: {
                label: STATUS_LABEL["PENDENTE"],
                color: STATUS_COLOR["PENDENTE"],
              },
              INATIVO: {
                label: STATUS_LABEL["INATIVO"],
                color: STATUS_COLOR["INATIVO"],
              },
              NULL: {
                label: STATUS_LABEL["NULL"],
                color: STATUS_COLOR["NULL"],
              },
            }}
            className="h-52 text-primary/30 sm:h-60"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={seriesAnimated}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={4}
                strokeWidth={2}
                isAnimationActive={false}
              >
                {seriesAnimated.map((s) => (
                  <Cell
                    key={s.key}
                    fill={s.fill}
                    stroke="oklch(0.623 0.214 259.815)"
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="outside"
                  fontSize={10}
                  formatter={(v: number) => (v > 0 ? v : "")}
                />
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-1 flex-wrap gap-2 text-xs"
              />
            </PieChart>
          </ChartContainer>

          <div className="grid grid-cols-2 gap-2 self-center sm:grid-cols-3">
            {seriesAnimated.map((s) => (
              <div key={s.key} className="rounded-lg border p-2">
                <div className="text-[10px] text-muted-foreground">
                  {s.name}
                </div>
                <div className="text-lg font-semibold">{s.value}</div>
                <div
                  className="mt-1 h-1.5 w-full rounded-full"
                  style={{ background: s.fill }}
                />
              </div>
            ))}
            {allZero && (
              <div className="col-span-2 sm:col-span-3 text-center text-xs text-muted-foreground">
                Ainda não há clientes cadastrados.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
    <div className="rounded-lg sm:rounded-xl border p-2 sm:p-2.5 md:p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
        {Icon ? (
          <Icon className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
        ) : null}
      </div>
      <div className="mt-1 text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
        {value}
      </div>
      {typeof tint !== "undefined" && (
        <div
          className="mt-1.5 h-1 w-full rounded-full sm:h-1.5 sm:mt-2"
          style={{ background: STATUS_COLOR[tint] }}
          aria-hidden
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border p-3 text-center text-xs text-muted-foreground sm:min-h-48 sm:p-4 md:p-6 md:text-sm">
      Nenhum cliente encontrado ainda. Cadastre clientes para ver os gráficos
      aqui.
    </div>
  );
}

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
  const [yStr = "", mStr = ""] = ym.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
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
