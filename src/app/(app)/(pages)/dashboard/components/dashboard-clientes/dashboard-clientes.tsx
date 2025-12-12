// ./src/app/(app)/(pages)/dashboard/components/dashboard-clientes.tsx
"use client";

import * as React from "react";
import clsx from "clsx";

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

import { RefreshCcw, Users, TrendingUp, Activity, MapPin } from "lucide-react";

// ----------------------------------------------------------
// Tipos e constantes
// ----------------------------------------------------------

export type DashboardClientesProps = {
  className?: string;
  endpointInsights?: string;
  endpointStatus?: string;
  autoRefreshMs?: number;
};

type StatusCliente = "ATIVO" | "INATIVO" | "PENDENTE" | "NULL";

type InsightsClientes = {
  totalClients: number;
  countsByStatus: Record<string, number>;
  countsByTipo: { FISICA: number; JURIDICA: number };
  byEstado: Record<string, number>;
  topCidades: { cidade: string; count: number }[];
  monthlyNew: { month: string; count: number }[];
  recent30d: number;
  prev30d: number;
};

const ORDEM_STATUS: StatusCliente[] = ["ATIVO", "PENDENTE", "INATIVO"];

const ROTULO_STATUS: Record<StatusCliente, string> = {
  ATIVO: "Ativos",
  PENDENTE: "Pendentes",
  INATIVO: "Inativos",
  NULL: "Sem status",
};

const COR_STATUS: Record<StatusCliente, string> = {
  ATIVO: "hsl(var(--chart-1))",
  PENDENTE: "hsl(var(--chart-2))",
  INATIVO: "hsl(var(--chart-3))",
  NULL: "hsl(var(--muted-foreground))",
};

// 12 meses anteriores no formato YYYY-MM
function criarMesesZerados(qtd = 12) {
  const agora = new Date();
  const meses: string[] = [];

  for (let i = qtd - 1; i >= 0; i--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    meses.push(ym);
  }

  return meses;
}

const MESES_ZERADOS = criarMesesZerados(12);

const INSIGHTS_INICIAIS: InsightsClientes = {
  totalClients: 0,
  countsByStatus: { ATIVO: 0, INATIVO: 0, PENDENTE: 0 },
  countsByTipo: { FISICA: 0, JURIDICA: 0 },
  byEstado: {},
  topCidades: [],
  monthlyNew: MESES_ZERADOS.map((m) => ({ month: m, count: 0 })),
  recent30d: 0,
  prev30d: 0,
};

const BARRAS_UF_PADRAO = [
  { uf: "SP", count: 0 },
  { uf: "RJ", count: 0 },
  { uf: "MG", count: 0 },
  { uf: "BA", count: 0 },
  { uf: "RS", count: 0 },
];

const CONTADOR_STATUS_INICIAL = {
  countsByStatus: { ATIVO: 0, INATIVO: 0, PENDENTE: 0 },
  totalClients: 0,
};

// ----------------------------------------------------------
// Tween / animação suave
// ----------------------------------------------------------

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Anima uma lista de números do estado atual até o alvo, com RAF.
 * Mantém tamanho da lista; se o alvo mudar de tamanho, faz pad de zeros.
 */
function useListaInterpolada(
  alvo: number[],
  {
    duracao = 700,
    easing = easeOutCubic,
    dependencias,
  }: {
    duracao?: number;
    easing?: (t: number) => number;
    dependencias?: React.DependencyList | any;
  } = {}
) {
  const [valores, setValores] = React.useState<number[]>(() => alvo.map(() => 0));
  const origemRef = React.useRef<number[]>(valores);

  React.useEffect(() => {
    const origem = origemRef.current;
    const tamAlvo = alvo.length;
    const tamOrigem = origem.length;

    const origemAjustada =
      tamOrigem === tamAlvo ? origem.slice() : Array.from({ length: tamAlvo }, (_, i) => origem[i] ?? 0);

    const destino = alvo.slice();

    let raf = 0;
    const inicio = performance.now();

    const tick = () => {
      const agora = performance.now();
      const t = Math.min(1, (agora - inicio) / duracao);
      const e = easing(t);

      const atual = destino.map((v, i) => origemAjustada[i] + (v - origemAjustada[i]) * e);
      setValores(atual);

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        origemRef.current = atual;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(alvo), duracao, ...(Array.isArray(dependencias) ? dependencias : [dependencias])]);

  return valores;
}

// ----------------------------------------------------------
// Hooks de dados
// ----------------------------------------------------------

function useInsightsClientes(endpoint: string, autoRefreshMs?: number) {
  const [dados, setDados] = React.useState<InsightsClientes | undefined>(undefined);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  const buscar = React.useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = (await res.json()) as InsightsClientes;
      setDados(json);
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao carregar insights");
      setDados(INSIGHTS_INICIAIS);
    } finally {
      setCarregando(false);
    }
  }, [endpoint]);

  React.useEffect(() => {
    buscar();
  }, [buscar]);

  React.useEffect(() => {
    if (!autoRefreshMs) return;
    const id = setInterval(buscar, autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, buscar]);

  return { dados, carregando, erro, recarregar: buscar };
}

function useContadorStatusClientes(endpoint: string, autoRefreshMs?: number) {
  type RespostaContadorStatus = {
    countsByStatus: Record<string, number>;
    totalClients: number;
  };

  const [dados, setDados] = React.useState<RespostaContadorStatus>(CONTADOR_STATUS_INICIAL);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<null | string>(null);

  const buscar = React.useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = (await res.json()) as RespostaContadorStatus;
      setDados(json);
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao carregar");
      setDados(CONTADOR_STATUS_INICIAL);
    } finally {
      setCarregando(false);
    }
  }, [endpoint]);

  React.useEffect(() => {
    buscar();
  }, [buscar]);

  React.useEffect(() => {
    if (!autoRefreshMs) return;
    const id = setInterval(buscar, autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, buscar]);

  return { dados, carregando, erro, recarregar: buscar };
}

// ----------------------------------------------------------
// Componente principal: DashboardClientes
// ----------------------------------------------------------

export default function DashboardClientes({
  className,
  endpointInsights = "/api/customers/insights",
  autoRefreshMs,
}: DashboardClientesProps) {
  const { dados: insights, carregando, erro, recarregar } = useInsightsClientes(endpointInsights, autoRefreshMs);

  const d = insights ?? INSIGHTS_INICIAIS;

  const total = d.totalClients;
  const ativos = d.countsByStatus?.["ATIVO"] ?? 0;
  const ativosPct = percentualDe(ativos, total);

  const novos30 = d.recent30d;
  const prev30 = d.prev30d;
  const crescimento30 = taxaCrescimento(novos30, prev30);

  const ufsAtendidas = Object.keys(d.byEstado ?? {}).length;
  const topCidades = d.topCidades ?? [];

  const dadosTipo = [
    {
      key: "FISICA",
      name: "Pessoa Física",
      value: d.countsByTipo?.FISICA ?? 0,
    },
    {
      key: "JURIDICA",
      name: "Pessoa Jurídica",
      value: d.countsByTipo?.JURIDICA ?? 0,
    },
  ];

  // Sempre 12 meses (sem buracos)
  const mesesBase = React.useMemo(() => {
    const mapa = new Map((d.monthlyNew ?? []).map((m) => [m.month, m.count]));
    return MESES_ZERADOS.map((m) => ({
      month: m,
      rotulo: formatarRotuloMes(m),
      count: mapa.get(m) ?? 0,
    }));
  }, [d.monthlyNew]);

  const alvoMeses = mesesBase.map((m) => m.count);
  const mesesInterpolados = useListaInterpolada(alvoMeses, {
    duracao: 800,
    dependencias: [d.recent30d, d.prev30d],
  });

  const dadosMensais = mesesBase.map((m, i) => ({
    ...m,
    count: Math.round(mesesInterpolados[i] ?? 0),
  }));

  const ufsBrutas = topUfs(d.byEstado ?? {}, 8);
  const ufsEstaveis = ufsBrutas.length ? ufsBrutas : BARRAS_UF_PADRAO;

  const alvoUfs = ufsEstaveis.map((u) => u.count);
  const ufsInterpoladas = useListaInterpolada(alvoUfs, {
    duracao: 700,
    dependencias: [ufsEstaveis.length],
  });

  const dadosUfs = ufsEstaveis.map((u, i) => ({
    ...u,
    count: Math.round(ufsInterpoladas[i] ?? 0),
  }));

  const alvoTipos = dadosTipo.map((t) => t.value);
  const tiposInterpolados = useListaInterpolada(alvoTipos, { duracao: 600 });

  const dadosTipoAnimados = dadosTipo.map((t, i) => ({
    ...t,
    valor: Math.max(0, Math.round(tiposInterpolados[i] ?? 0)),
  }));

  return (
    <Card className={clsx("w-full", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" /> Dashboard de Clientes
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Visão geral da base de clientes, distribuição geográfica e tendências (últimos 12 meses).
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
            onClick={recarregar}
            aria-label="Atualizar"
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 bg-transparent"
          >
            <RefreshCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* KPIs principais */}
        <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-6 sm:gap-3 md:gap-4">
          <IndicadorResumo label="Total" valor={total} icone={Users} />
          <IndicadorResumo label="Novos (30d)" valor={novos30} icone={Activity} />
          <IndicadorResumo label="Crescimento (30d)" valor={`${crescimento30}%`} />
          <IndicadorResumo label="% Ativos" valor={`${ativosPct}%`} />
          <IndicadorResumo label="UFs atendidas" valor={ufsAtendidas} icone={MapPin} />
          <IndicadorResumo label="Top cidades" valor={Math.min(10, topCidades.length)} />
        </div>

        {/* Erro */}
        {erro && !carregando && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-xs sm:p-3 sm:text-sm">
            Erro ao carregar insights: <span className="font-medium">{erro}</span>
          </div>
        )}

        {/* Gráficos */}
        <div
          className={clsx("grid w-full grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3", carregando && "opacity-80")}
        >
          {/* Área - Novos por mês */}
          <div className="rounded-xl border bg-card p-2 sm:p-3 md:p-4 lg:col-span-3">
            <div className="mb-2 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium sm:text-sm">Novos clientes por mês</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">Últimos 12 meses</p>
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
              <AreaChart data={dadosMensais} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaFillClientes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="80%" stopColor="currentColor" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="rotulo"
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
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="currentColor"
                  fill="url(#areaFillClientes)"
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
                <p className="text-xs font-medium sm:text-sm">Top UFs por clientes</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">Estados com mais clientes</p>
              </div>
              <Badge variant="outline" className="w-fit text-xs">
                Barras
              </Badge>
            </div>

            <ChartContainer
              config={{
                count: { label: "Clientes", color: "hsl(var(--chart-2))" },
              }}
              className="h-48 text-primary/30 xs:h-56 sm:h-64 md:h-72"
            >
              <BarChart data={dadosUfs} margin={{ top: 16, right: 8, left: -12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
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
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Bar
                  dataKey="count"
                  stroke="oklch(0.623 0.214 259.815)"
                  strokeWidth={2}
                  fill="currentColor"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={false}
                >
                  <LabelList dataKey="count" position="top" className="fill-foreground" fontSize={10} />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>

          {/* Pizza - Tipo de pessoa */}
          <div className="rounded-xl border bg-card p-2 sm:p-3 md:p-4 lg:col-span-1">
            <div className="mb-2 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium sm:text-sm">Tipo de pessoa</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">Física x Jurídica</p>
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
                  data={dadosTipoAnimados}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  strokeWidth={2}
                  isAnimationActive={false}
                  className="xs:innerRadius-[48] xs:outerRadius-[80] sm:innerRadius-[60] sm:outerRadius-[95]"
                >
                  {dadosTipoAnimados.map((entrada) => (
                    <Cell key={entrada.key} fill="currentColor" stroke="oklch(0.623 0.214 259.815)" />
                  ))}

                  <LabelList
                    dataKey="value"
                    position="outside"
                    fontSize={12}
                    stroke="none"
                    formatter={(valor: number) => (valor > 0 ? valor : "")}
                    className="fill-foreground"
                  />
                </Pie>

                <ChartLegend
                  content={<ChartLegendContent nameKey="key" />}
                  className={clsx(
                    "-translate-y-2 flex-wrap gap-2 text-xs [&>*]:basis-1/2 [&>*]:justify-center sm:[&>*]:basis-1/4"
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

// ----------------------------------------------------------
// Cartão de status dos clientes
// ----------------------------------------------------------

export type CartaoStatusClientesProps = {
  className?: string;
  endpoint?: string;
  autoRefreshMs?: number;
};

export function CartaoStatusClientes({
  className,
  endpoint = "/api/customers/status-counter",
  autoRefreshMs,
}: CartaoStatusClientesProps) {
  const { dados, carregando, erro, recarregar } = useContadorStatusClientes(endpoint, autoRefreshMs);

  const contagens = dados.countsByStatus ?? { ATIVO: 0, INATIVO: 0, PENDENTE: 0 };

  const series = (ORDEM_STATUS.concat(["NULL"]) as StatusCliente[])
    .map((chave) => ({
      key: chave,
      name: ROTULO_STATUS[chave],
      value: (contagens as any)[chave] ?? 0,
      fill: COR_STATUS[chave],
    }))
    .filter((s) => s.value > 0 || statusConhecido(s.key));

  const alvo = series.map((s) => s.value);
  const valoresInterpolados = useListaInterpolada(alvo, { duracao: 600 });

  const seriesAnimada = series.map((s, i) => ({
    ...s,
    value: Math.round(valoresInterpolados[i] ?? 0),
  }));

  const tudoZero = seriesAnimada.every((s) => s.value === 0);

  return (
    <Card className={clsx("w-full", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 px-3 py-3 sm:px-4 sm:py-4">
        <div>
          <CardTitle className="text-base sm:text-lg">Status dos Clientes</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Distribuição por status da base</CardDescription>
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
            onClick={recarregar}
            aria-label="Atualizar"
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <RefreshCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
        {erro && !carregando && (
          <div className="mb-3 rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-xs sm:p-3 sm:text-sm">
            Erro ao carregar: <span className="font-medium">{erro}</span>
          </div>
        )}

        <div className={clsx("grid grid-cols-1 gap-3 sm:grid-cols-2", carregando && "opacity-80")}>
          <ChartContainer
            config={{
              ATIVO: {
                label: ROTULO_STATUS["ATIVO"],
                color: COR_STATUS["ATIVO"],
              },
              PENDENTE: {
                label: ROTULO_STATUS["PENDENTE"],
                color: COR_STATUS["PENDENTE"],
              },
              INATIVO: {
                label: ROTULO_STATUS["INATIVO"],
                color: COR_STATUS["INATIVO"],
              },
              NULL: {
                label: ROTULO_STATUS["NULL"],
                color: COR_STATUS["NULL"],
              },
            }}
            className="h-52 text-primary/30 sm:h-60"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={seriesAnimada}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={4}
                strokeWidth={2}
                isAnimationActive={false}
              >
                {seriesAnimada.map((s) => (
                  <Cell key={s.key} fill={s.fill} stroke="oklch(0.623 0.214 259.815)" />
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
            {seriesAnimada.map((s) => (
              <div key={s.key} className="rounded-lg border p-2">
                <div className="text-[10px] text-muted-foreground">{s.name}</div>
                <div className="text-lg font-semibold">{s.value}</div>
                <div className="mt-1 h-1.5 w-full rounded-full" style={{ background: s.fill }} />
              </div>
            ))}

            {tudoZero && (
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

// ----------------------------------------------------------
// Componentes menores & utilitários
// ----------------------------------------------------------

function IndicadorResumo({
  label,
  valor,
  icone: Icone,
  corStatus,
}: {
  label: string;
  valor: number | string;
  icone?: React.ComponentType<{ className?: string }>;
  corStatus?: StatusCliente;
}) {
  return (
    <div className="rounded-lg sm:rounded-xl border p-2 sm:p-2.5 md:p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
        {Icone ? <Icone className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" /> : null}
      </div>
      <div className="mt-1 text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">{valor}</div>
      {corStatus && (
        <div
          className="mt-1.5 h-1 w-full rounded-full sm:h-1.5 sm:mt-2"
          style={{ background: COR_STATUS[corStatus] }}
          aria-hidden
        />
      )}
    </div>
  );
}

function statusConhecido(chave: StatusCliente) {
  return chave === "ATIVO" || chave === "INATIVO" || chave === "PENDENTE";
}

function percentualDe(valor: number, total: number) {
  return total ? Math.round((valor / total) * 100) : 0;
}

function taxaCrescimento(atual: number, anterior: number) {
  if (!anterior && !atual) return 0;
  if (!anterior) return 100;
  return Math.round(((atual - anterior) / anterior) * 100);
}

function formatarRotuloMes(ym: string) {
  const [yStr = "", mStr = ""] = ym.split("-");
  const ano = Number(yStr);
  const mes = Number(mStr);

  const indiceMes = Number.isFinite(mes) && mes >= 1 && mes <= 12 ? mes - 1 : 0;
  const anoValido = Number.isFinite(ano) ? ano : new Date().getFullYear();

  const d = new Date(anoValido, indiceMes, 1);
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

function topUfs(byUF: Record<string, number>, limite = 8) {
  return Object.entries(byUF)
    .map(([uf, count]) => ({ uf, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limite);
}
