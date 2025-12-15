"use client";

import * as React from "react";
import clsx from "clsx";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { AreaChart, Area, CartesianGrid, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell, LabelList } from "recharts";

import {
  RefreshCcw,
  CalendarIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  AlertCircle,
  CreditCard,
  SlidersHorizontal,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";

/* ======================== TIPOS / CONSTANTES ======================== */

export type ResumoFinanceiro = {
  periodo: {
    inicio: string;
    fim: string;
  };
  totais: {
    receita: number;
    despesa: number;
    saldo: number;
    receitaPendente: number;
  };
  fluxoDiario: {
    data: string;
    receita: number;
    despesa: number;
    saldoAcumulado: number;
  }[];
  porCategoria: {
    categoria: string;
    receita: number;
    despesa: number;
  }[];
  porMetodoPagamento: {
    metodo: string;
    valor: number;
  }[];
};

export type PropriedadesDashboardFinanceiro = {
  className?: string;
  endpoint?: string; // default: /api/transaction
  autoAtualizarMs?: number;
};

type TipoSerieFluxo = "TODOS" | "ENTRADAS" | "SAIDAS" | "SALDO";

const RESUMO_INICIAL: ResumoFinanceiro = {
  periodo: {
    inicio: new Date().toISOString(),
    fim: new Date().toISOString(),
  },
  totais: {
    receita: 0,
    despesa: 0,
    saldo: 0,
    receitaPendente: 0,
  },
  fluxoDiario: [],
  porCategoria: [],
  porMetodoPagamento: [],
};

const formatarMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// Cores explícitas para ficar autoexplicativo visualmente
const COR_RECEITA = "hsl(142 76% 36%)"; // verde
const COR_DESPESA = "hsl(0 72% 51%)"; // vermelho
const COR_SALDO_POSITIVO = "hsl(221 83% 53%)"; // azul
const COR_SALDO_NEGATIVO = "hsl(24 94% 50%)"; // laranja/alerta

// Cores para cada fatia do gráfico de métodos de pagamento
const CORES_METODOS = [
  "hsl(221 83% 53%)",
  "hsl(142 76% 36%)",
  "hsl(24 94% 50%)",
  "hsl(0 72% 51%)",
  "hsl(262 83% 58%)",
  "hsl(196 100% 50%)",
  "hsl(48 96% 53%)",
];

/* ======================== DATAS ======================== */

// intervalo padrão: últimos 30 dias
function obterPeriodoInicial(): { inicio: Date; fim: Date } {
  const hoje = new Date();

  // fim = hoje às 23:59:59
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);

  // inicio = primeiro dia do mês atual às 00:00:00
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0);

  return { inicio, fim };
}

function formatarDataCurta(d: Date) {
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatarDataCompleta(d: Date) {
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// formato que sua API espera: YYYY-MM-DD
function formatarDataYYYYMMDD(d: Date) {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/* ============ HELPERS PARA RESUMO FINANCEIRO ============ */

// Caso o backend já retorne algo no formato "resumo"
function normalizarResumoBruto(json: any, inicio: Date, fim: Date): ResumoFinanceiro {
  const receita = Number(json?.totais?.receita ?? 0);
  const despesa = Number(json?.totais?.despesa ?? 0);
  const saldo = json?.totais?.saldo != null ? Number(json.totais.saldo) : receita - despesa;

  return {
    periodo: {
      inicio: String(json?.periodo?.inicio ?? inicio.toISOString()),
      fim: String(json?.periodo?.fim ?? fim.toISOString()),
    },
    totais: {
      receita,
      despesa,
      saldo,
      receitaPendente: Number(json?.totais?.receitaPendente ?? 0),
    },
    fluxoDiario: Array.isArray(json?.fluxoDiario)
      ? json.fluxoDiario.map((p: any) => ({
          data: String(p.data),
          receita: Number(p.receita ?? 0),
          despesa: Number(p.despesa ?? 0),
          saldoAcumulado: Number(p.saldoAcumulado ?? 0),
        }))
      : [],
    porCategoria: Array.isArray(json?.porCategoria)
      ? json.porCategoria.map((c: any) => ({
          categoria: String(c.categoria ?? c.nome ?? "Outros"),
          receita: Number(c.receita ?? 0),
          despesa: Number(c.despesa ?? 0),
        }))
      : [],
    porMetodoPagamento: Array.isArray(json?.porMetodoPagamento)
      ? json.porMetodoPagamento.map((m: any) => ({
          metodo: String(m.metodo ?? m.metodopagamento ?? "Não informado"),
          valor: Number(m.valor ?? 0),
        }))
      : [],
  };
}

/**
 * Monta o resumo a partir de uma LISTA de transações.
 * Usa tipos: RECEITA, DESPESA, DEPOSITO, SAQUE.
 * Gera **todos os dias** do intervalo (mesmo sem movimento).
 */
function montarResumoDeLista(lista: any[], inicio: Date, fim: Date): ResumoFinanceiro {
  let receita = 0;
  let despesa = 0;
  let receitaPendente = 0;

  const porDia = new Map<string, { receita: number; despesa: number }>();
  const porCategoria = new Map<string, { receita: number; despesa: number }>();
  const porMetodo = new Map<string, number>();

  for (const item of lista) {
    const valor = Number(item?.valor ?? 0);
    if (!Number.isFinite(valor) || valor === 0) continue;

    const tipo = String(item?.tipo ?? "").toUpperCase() as "RECEITA" | "DESPESA" | "DEPOSITO" | "SAQUE" | string;

    const dataStr: string | undefined = item?.data ?? item?.created_at ?? item?.createdAt ?? item?.data_transacao;

    if (!dataStr) continue;
    const d = new Date(dataStr);
    if (Number.isNaN(d.getTime())) continue;

    // respeita intervalo selecionado no filtro
    if (d < inicio || d > fim) continue;

    const chaveDia = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);

    const ehEntrada = tipo === "RECEITA" || tipo === "DEPOSITO";
    const ehSaida = tipo === "DESPESA" || tipo === "SAQUE";

    if (ehEntrada) receita += valor;
    if (ehSaida) despesa += valor;

    const pendenteFlag = item?.pendente === true || String(item?.pendente).toLowerCase() === "true";
    if (ehEntrada && pendenteFlag) receitaPendente += valor;

    // por dia
    let dia = porDia.get(chaveDia);
    if (!dia) {
      dia = { receita: 0, despesa: 0 };
      porDia.set(chaveDia, dia);
    }
    if (ehEntrada) dia.receita += valor;
    if (ehSaida) dia.despesa += valor;

    // por categoria
    const categoriaRaw =
      item?.categoria ?? item?.categoria_nome ?? item?.categoriatransacao ?? item?.categoriaTransacao;
    const categoria = categoriaRaw ? String(categoriaRaw) : "Outros";

    let catAgg = porCategoria.get(categoria);
    if (!catAgg) {
      catAgg = { receita: 0, despesa: 0 };
      porCategoria.set(categoria, catAgg);
    }
    if (ehEntrada) catAgg.receita += valor;
    if (ehSaida) catAgg.despesa += valor;

    // por método (apenas entradas)
    const metodoRaw = item?.metodopagamento ?? item?.metodo_pagamento ?? item?.metodoPagamento;
    const metodo = metodoRaw ? String(metodoRaw) : "Não informado";

    if (ehEntrada) {
      porMetodo.set(metodo, (porMetodo.get(metodo) ?? 0) + valor);
    }
  }

  const saldo = receita - despesa;

  // Garante **todos os dias** do intervalo, mesmo se não tiver movimento
  const inicioDia = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
  const fimDia = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate());

  const fluxoDiario: ResumoFinanceiro["fluxoDiario"] = [];
  let saldoAcumulado = 0;

  for (let d = new Date(inicioDia.getTime()); d <= fimDia; d.setDate(d.getDate() + 1)) {
    const chaveDia = d.toISOString().slice(0, 10);
    const v = porDia.get(chaveDia) ?? { receita: 0, despesa: 0 };
    saldoAcumulado += v.receita - v.despesa;

    fluxoDiario.push({
      data: chaveDia,
      receita: v.receita,
      despesa: v.despesa,
      saldoAcumulado,
    });
  }

  const listaPorCategoria = Array.from(porCategoria.entries()).map(([categoria, v]) => ({
    categoria,
    receita: v.receita,
    despesa: v.despesa,
  }));

  const listaPorMetodo = Array.from(porMetodo.entries()).map(([metodo, valor]) => ({
    metodo,
    valor,
  }));

  return {
    periodo: {
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
    },
    totais: {
      receita,
      despesa,
      saldo,
      receitaPendente,
    },
    fluxoDiario,
    porCategoria: listaPorCategoria,
    porMetodoPagamento: listaPorMetodo,
  };
}

/* ==================== HOOK DE DADOS ==================== */

function useResumoFinanceiro(
  endpoint: string,
  {
    inicio,
    fim,
    autoAtualizarMs,
  }: {
    inicio: Date | null;
    fim: Date | null;
    autoAtualizarMs?: number;
  }
) {
  const [dados, setDados] = React.useState<ResumoFinanceiro>(RESUMO_INICIAL);
  const [transacoes, setTransacoes] = React.useState<any[]>([]);
  const [carregando, setCarregando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const buscar = React.useCallback(async () => {
    if (!inicio || !fim) {
      setDados(RESUMO_INICIAL);
      setTransacoes([]);
      return;
    }

    try {
      setCarregando(true);
      setErro(null);

      const params = new URLSearchParams({
        dateFrom: formatarDataYYYYMMDD(inicio),
        dateTo: formatarDataYYYYMMDD(fim),
        limit: "1000",
      });

      const resposta = await fetch(`${endpoint}?${params.toString()}`, {
        cache: "no-store",
      });

      if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status}`);
      }

      const json = await resposta.json();

      let resumo: ResumoFinanceiro;
      let listaTransacoes: any[] = [];

      if (Array.isArray(json)) {
        listaTransacoes = json;
        resumo = montarResumoDeLista(listaTransacoes, inicio, fim);
      } else if (Array.isArray(json.data)) {
        listaTransacoes = json.data;
        resumo = montarResumoDeLista(listaTransacoes, inicio, fim);
      } else {
        resumo = normalizarResumoBruto(json, inicio, fim);
        listaTransacoes = [];
      }

      setDados(resumo);
      setTransacoes(listaTransacoes);
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao carregar dados financeiros");
      setDados(RESUMO_INICIAL);
      setTransacoes([]);
    } finally {
      setCarregando(false);
    }
  }, [endpoint, inicio, fim]);

  React.useEffect(() => {
    buscar();
  }, [buscar]);

  React.useEffect(() => {
    if (!autoAtualizarMs) return;
    const id = setInterval(buscar, autoAtualizarMs);
    return () => clearInterval(id);
  }, [autoAtualizarMs, buscar]);

  return { dados, transacoes, carregando, erro, recarregar: buscar };
}

/* ==================== COMPONENTE PRINCIPAL ==================== */

export default function DashboardFinanceiro({
  className,
  endpoint = "/api/transaction",
  autoAtualizarMs,
}: PropriedadesDashboardFinanceiro) {
  const periodoInicial = React.useMemo(() => obterPeriodoInicial(), []);
  const [dataInicio, setDataInicio] = React.useState<Date | null>(periodoInicial.inicio);
  const [dataFim, setDataFim] = React.useState<Date | null>(periodoInicial.fim);
  const [filtroAberto, setFiltroAberto] = React.useState(false);
  const [tipoFluxo, setTipoFluxo] = React.useState<TipoSerieFluxo>("TODOS");

  // filtro cruzado por método de pagamento (clicando no gráfico de pizza)
  const [metodoSelecionado, setMetodoSelecionado] = React.useState<string | null>(null);

  const { dados, transacoes, carregando, erro, recarregar } = useResumoFinanceiro(endpoint, {
    inicio: dataInicio,
    fim: dataFim,
    autoAtualizarMs,
  });

  // resumo base (sem filtro de método)
  const resumoBase = dados;

  // helper para extrair método da transação (mesma lógica usada em montarResumoDeLista)
  function obterMetodoTransacao(item: any): string {
    const metodoRaw = item?.metodopagamento ?? item?.metodo_pagamento ?? item?.metodoPagamento;
    return metodoRaw ? String(metodoRaw) : "Não informado";
  }

  // resumo filtrado por método de pagamento (se houver um selecionado)
  const resumoFiltrado: ResumoFinanceiro = React.useMemo(() => {
    if (!metodoSelecionado || !dataInicio || !dataFim) {
      return resumoBase;
    }

    const filtradas = transacoes.filter((t) => obterMetodoTransacao(t) === metodoSelecionado);

    return montarResumoDeLista(filtradas, dataInicio, dataFim);
  }, [metodoSelecionado, transacoes, dataInicio, dataFim, resumoBase]);

  // Usamos o resumo filtrado para KPIs, fluxo e categorias
  const { receita, despesa, saldo, receitaPendente } = resumoFiltrado.totais;

  const fluxo = React.useMemo(
    () =>
      (resumoFiltrado.fluxoDiario ?? []).map((ponto) => {
        const d = new Date(ponto.data);
        return {
          ...ponto,
          dataRotulo: formatarDataCurta(d),
        };
      }),
    [resumoFiltrado.fluxoDiario]
  );

  const categorias = resumoFiltrado.porCategoria ?? [];

  // Para o gráfico de métodos, usamos sempre o resumo base (sem filtro)
  const metodos = resumoBase.porMetodoPagamento ?? [];

  // se tiver muitas categorias no total, expandimos layout
  const muitasCategorias = (resumoBase.porCategoria ?? []).length > 8;

  const saldoPositivo = saldo >= 0;
  const corSaldoLinha = saldoPositivo ? COR_SALDO_POSITIVO : COR_SALDO_NEGATIVO;

  const textoPeriodo =
    dataInicio && dataFim
      ? `${formatarDataCompleta(dataInicio)} — ${formatarDataCompleta(dataFim)}`
      : "Período não definido";

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
    const { inicio, fim } = obterPeriodoInicial();
    setDataInicio(inicio);
    setDataFim(fim);
    setMetodoSelecionado(null);
  }

  // Tick customizado para o eixo X do gráfico de categorias
  function CategoriaTick(props: any) {
    const { x, y, payload } = props;
    const label: string = payload?.value ?? "";
    const maxLen = 14; // tamanho máximo antes de cortar
    const display = label.length > maxLen ? label.slice(0, maxLen).trimEnd() + "…" : label;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fontSize={11} className="fill-muted-foreground">
          <title>{label}</title>
          {display}
        </text>
      </g>
    );
  }

  return (
    <Card className={clsx("w-full", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
            Dashboard Financeiro
          </CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span>Visão geral de receitas, despesas e fluxo de caixa a partir das transações.</span>
            <Badge variant="default" className="text-[10px] sm:text-xs">Período: {textoPeriodo} </Badge>
          </CardDescription>
          

          {metodoSelecionado && (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary text-[10px] text-primary sm:text-xs">
                Filtro de método: {metodoSelecionado}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px]"
                onClick={() => setMetodoSelecionado(null)}
              >
                Limpar filtro de método
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <SheetFinanceiroFiltros
            aberto={filtroAberto}
            aoMudarAberto={setFiltroAberto}
            dataInicio={dataInicio}
            dataFim={dataFim}
            aoMudarDataInicio={tratarDataInicio}
            aoMudarDataFim={tratarDataFim}
            aoLimpar={limparFiltros}
          />

          <div className="flex items-center gap-2">
            {autoAtualizarMs ? (
              <Badge variant="secondary" className="whitespace-nowrap text-[10px] sm:text-xs">
                Auto · {Math.round((autoAtualizarMs ?? 0) / 1000)}s
              </Badge>
            ) : null}
            <Button
              variant="outline"
              size="icon"
              onClick={recarregar}
              aria-label="Atualizar"
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <RefreshCcw className={cn("h-3.5 w-3.5", carregando && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-3 pb-3 sm:space-y-5 sm:px-4 sm:pb-4">
        {erro && !carregando && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/60 bg-destructive/10 p-2 text-xs sm:p-3 sm:text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
            <div>
              <p className="font-medium">Erro ao carregar dados financeiros</p>
              <p className="text-xs text-destructive/80">{erro}</p>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className={clsx("grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4", carregando && "opacity-80")}>
          <KpiFinanceiro
            rotulo="Receitas"
            valor={formatarMoeda.format(receita)}
            Icone={ArrowUpCircle}
            destaque="positivo"
          />
          <KpiFinanceiro
            rotulo="Despesas"
            valor={formatarMoeda.format(despesa)}
            Icone={ArrowDownCircle}
            destaque="negativo"
          />
          <KpiFinanceiro
            rotulo="Saldo do período"
            valor={formatarMoeda.format(saldo)}
            Icone={Wallet}
            destaque={saldoPositivo ? "positivo" : "negativo"}
          />
          <KpiFinanceiro rotulo="Receitas pendentes" valor={formatarMoeda.format(receitaPendente)} Icone={CreditCard} />
        </div>

        {/* Gráficos */}
        <div className={clsx("grid grid-cols-1 gap-3 lg:grid-cols-3", carregando && "opacity-80")}>
          {/* Fluxo de caixa */}
          <div className="rounded-xl border bg-card p-2 sm:p-3 md:p-4 lg:col-span-3">
            <div className="mb-2 flex flex-col items-start justify-between gap-2 sm:mb-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-medium sm:text-sm">Fluxo de caixa</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Entradas, saídas e saldo acumulado por dia
                </p>
              </div>

              {/* Select do tipo de fluxo – usando shadcn UI */}
              <Select value={tipoFluxo} onValueChange={(v) => setTipoFluxo(v as TipoSerieFluxo)}>
                <SelectTrigger className="h-8 w-[180px] text-xs sm:h-9">
                  <SelectValue placeholder="Tipo de fluxo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Entradas e saídas</SelectItem>
                  <SelectItem value="ENTRADAS">Somente entradas</SelectItem>
                  <SelectItem value="SAIDAS">Somente saídas</SelectItem>
                  <SelectItem value="SALDO">Somente saldo acumulado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ChartContainer
              config={{
                receita: {
                  label: "Receitas (entradas)",
                  color: COR_RECEITA,
                },
                despesa: {
                  label: "Despesas (saídas)",
                  color: COR_DESPESA,
                },
                saldoAcumulado: {
                  label: `Saldo acumulado (${saldoPositivo ? "positivo" : "negativo"})`,
                  color: corSaldoLinha,
                },
              }}
              className="h-56 w-full sm:h-64 md:h-72 lg:h-80"
            >
              <AreaChart data={fluxo} margin={{ top: 12, right: 16, left: 48, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="dataRotulo"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  fontSize={11}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  fontSize={11}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => formatarMoeda.format(v).replace("R$", "").trim()}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      // Aqui deixamos bem explícito o que é cada valor
                      labelFormatter={(label) => `Dia ${label}`}
                    />
                  }
                />

                {(tipoFluxo === "TODOS" || tipoFluxo === "ENTRADAS") && (
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke={COR_RECEITA}
                    fill="hsl(142 76% 36% / 0.12)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive
                  />
                )}

                {(tipoFluxo === "TODOS" || tipoFluxo === "SAIDAS") && (
                  <Area
                    type="monotone"
                    dataKey="despesa"
                    stroke={COR_DESPESA}
                    fill="hsl(0 72% 51% / 0.10)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive
                  />
                )}

                {(tipoFluxo === "TODOS" || tipoFluxo === "SALDO") && (
                  <Area
                    type="monotone"
                    dataKey="saldoAcumulado"
                    stroke={corSaldoLinha}
                    fill="transparent"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive
                  />
                )}
              </AreaChart>
            </ChartContainer>
          </div>

          {/* Categorias */}
          <div
            className={clsx(
              "rounded-xl border bg-card p-2 sm:p-3 md:p-4",
              muitasCategorias ? "lg:col-span-3" : "lg:col-span-2"
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
              <div>
                <p className="text-xs font-medium sm:text-sm">Por categoria</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Comparativo de receitas e despesas por categoria
                </p>
              </div>
            </div>

            {/* wrapper com scroll horizontal em telas menores */}
            <div className="mt-1 w-full overflow-x-auto">
              <div
                className={clsx(
                  "h-64 sm:h-72 md:h-80",
                  // se tiver muitas categorias no total, garante uma largura mínima pro gráfico
                  muitasCategorias && "min-w-[640px]"
                )}
              >
                <ChartContainer
                  config={{
                    receita: {
                      label: "Receitas",
                      color: COR_RECEITA,
                    },
                    despesa: {
                      label: "Despesas",
                      color: COR_DESPESA,
                    },
                  }}
                  className="h-full w-full"
                >
                  <BarChart
                    data={categorias}
                    margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
                    barSize={40}
                    barCategoryGap={32}
                    barGap={12}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />

                    <XAxis
                      dataKey="categoria"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={12}
                      interval={0}
                      height={40}
                      tick={<CategoriaTick />}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickMargin={12}
                      fontSize={11}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v) => formatarMoeda.format(v).replace("R$", "").trim()}
                    />

                    <ChartTooltip content={<ChartTooltipContent />} />

                    <Bar dataKey="receita" stroke={COR_RECEITA} fill={COR_RECEITA} radius={[4, 4, 0, 0]}>
                      <LabelList
                        dataKey="receita"
                        position="top"
                        fontSize={10}
                        formatter={(v: number) => (v > 0 ? formatarMoeda.format(v).replace("R$", "").trim() : "")}
                      />
                    </Bar>

                    <Bar dataKey="despesa" stroke={COR_DESPESA} fill={COR_DESPESA} radius={[4, 4, 0, 0]}>
                      <LabelList
                        dataKey="despesa"
                        position="top"
                        fontSize={10}
                        formatter={(v: number) => (v > 0 ? formatarMoeda.format(v).replace("R$", "").trim() : "")}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
          </div>

          {/* Métodos de pagamento */}
          <div
            className={clsx(
              "rounded-xl border bg-card p-2 sm:p-3 md:p-4",
              muitasCategorias ? "lg:col-span-3" : "lg:col-span-1"
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
              <div>
                <p className="text-xs font-medium sm:text-sm">Métodos de pagamento</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">Distribuição de receitas por método</p>
              </div>
            </div>

            <ChartContainer
              config={{
                valor: {
                  label: "Valor",
                  color: "hsl(221 83% 53%)",
                },
              }}
              className={clsx("w-full", muitasCategorias ? "h-56 sm:h-60 md:h-64" : "h-52 sm:h-60 md:h-64")}
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => String(label)}
                      formatter={(valor) => formatarMoeda.format(Number(valor ?? 0))}
                    />
                  }
                />

                <Pie
                  data={metodos}
                  dataKey="valor"
                  nameKey="metodo"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  strokeWidth={2}
                  isAnimationActive
                  onClick={(_, index: number) => {
                    const metodo = metodos[index]?.metodo;
                    if (!metodo) return;
                    setMetodoSelecionado((prev) => (prev === metodo ? null : metodo));
                  }}
                >
                  {metodos.map((entrada, indice) => {
                    const metodo = entrada.metodo;
                    const selecionado = metodoSelecionado === metodo;
                    const filtroAtivo = !!metodoSelecionado;

                    return (
                      <Cell
                        key={metodo ?? indice}
                        fill={CORES_METODOS[indice % CORES_METODOS.length]}
                        stroke={selecionado ? "hsl(0 0% 100%)" : "hsl(var(--border))"}
                        strokeWidth={selecionado ? 3 : 1}
                        opacity={!filtroAtivo || selecionado ? 1 : 0.4}
                        className="cursor-pointer transition-all"
                      />
                    );
                  })}
                  <LabelList
                    dataKey="valor"
                    position="outside"
                    fontSize={10}
                    formatter={(v: number) => (v > 0 ? formatarMoeda.format(v).replace("R$", "").trim() : "")}
                    className="fill-foreground"
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="mt-2 space-y-1.5">
              {metodos.slice(0, 4).map((m) => {
                const selecionado = metodoSelecionado === m.metodo;
                const filtroAtivo = !!metodoSelecionado;

                return (
                  <button
                    key={m.metodo}
                    type="button"
                    onClick={() => setMetodoSelecionado((prev) => (prev === m.metodo ? null : m.metodo))}
                    className={cn(
                      "flex w-full items-center justify-between rounded px-1 py-0.5 text-left text-xs transition-colors",
                      "hover:bg-muted/60",
                      filtroAtivo && !selecionado && "opacity-60",
                      selecionado && "bg-primary/10 text-primary"
                    )}
                  >
                    <span className="truncate text-muted-foreground">{m.metodo}</span>
                    <span className="font-medium">{formatarMoeda.format(m.valor)}</span>
                  </button>
                );
              })}
              {metodos.length === 0 && (
                <p className="text-center text-[11px] text-muted-foreground">Ainda não há lançamentos no período.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ==================== SHEET DE FILTROS (somente datas) ==================== */

type PropriedadesSheetFinanceiroFiltros = {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  dataInicio: Date | null;
  dataFim: Date | null;
  aoMudarDataInicio: (data?: Date) => void;
  aoMudarDataFim: (data?: Date) => void;
  aoLimpar: () => void;
};

function SheetFinanceiroFiltros({
  aberto,
  aoMudarAberto,
  dataInicio,
  dataFim,
  aoMudarDataInicio,
  aoMudarDataFim,
  aoLimpar,
}: PropriedadesSheetFinanceiroFiltros) {
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
          <SheetTitle>Filtros financeiros</SheetTitle>
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
          <div className="mt-2 flex justify-between gap-2">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={aoLimpar}>
              Limpar filtros
            </Button>
            <SheetClose asChild>
              <Button type="button" className="w-full sm:w-auto">
                Aplicar filtros
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ==================== KPI ==================== */

type PropriedadesKpiFinanceiro = {
  rotulo: string;
  valor: string;
  Icone?: React.ComponentType<{ className?: string }>;
  destaque?: "positivo" | "negativo";
};

function KpiFinanceiro({ rotulo, valor, Icone, destaque }: PropriedadesKpiFinanceiro) {
  const corBarra =
    destaque === "positivo" ? "bg-emerald-500/80" : destaque === "negativo" ? "bg-red-500/80" : "bg-muted";

  return (
    <div className="rounded-lg border p-2.5 sm:rounded-xl sm:p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground sm:text-sm">{rotulo}</p>
        {Icone ? <Icone className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" /> : null}
      </div>
      <div className="mt-1 text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">{valor}</div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
        <div className={clsx("h-full w-2/3 rounded-full", corBarra)} />
      </div>
    </div>
  );
}
