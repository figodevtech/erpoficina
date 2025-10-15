"use client";

import { JSX, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  ClipboardList,
  Wrench,
  Loader2,
  CreditCard,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { OrdensTabela } from "./ordens-tabela";
import { createClient } from "@supabase/supabase-js";

export type StatusOS =
  | "TODAS"
  | "ABERTO"
  | "EM_ANDAMENTO"
  | "PAGAMENTO"
  | "CONCLUIDO"
  | "CANCELADO";

const statusTabs: { key: StatusOS; label: string; icon: JSX.Element; dot: string; active: string }[] = [
  {
    key: "TODAS",
    label: "Todas",
    icon: <ClipboardList className="h-4 w-4" />,
    dot: "bg-slate-400",
    active:
      "data-[state=active]:bg-slate-500/15 data-[state=active]:text-slate-200 data-[state=active]:ring-slate-500/30",
  },
  {
    key: "ABERTO",
    label: "Aberto",
    icon: <Wrench className="h-4 w-4" />,
    dot: "bg-amber-500",
    active:
      "data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-200 data-[state=active]:ring-amber-500/30",
  },
  {
    key: "EM_ANDAMENTO",
    label: "Em Andamento",
    icon: <Loader2 className="h-4 w-4" />,
    dot: "bg-blue-500",
    active:
      "data-[state=active]:bg-blue-500/15 data-[state=active]:text-blue-200 data-[state=active]:ring-blue-500/30",
  },
  {
    key: "PAGAMENTO",
    label: "Pagamento",
    icon: <CreditCard className="h-4 w-4" />,
    dot: "bg-indigo-500",
    active:
      "data-[state=active]:bg-indigo-500/15 data-[state=active]:text-indigo-200 data-[state=active]:ring-indigo-500/30",
  },
  {
    key: "CONCLUIDO",
    label: "Concluído",
    icon: <CheckCircle2 className="h-4 w-4" />,
    dot: "bg-emerald-500",
    active:
      "data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200 data-[state=active]:ring-emerald-500/30",
  },
  {
    key: "CANCELADO",
    label: "Cancelado",
    icon: <XCircle className="h-4 w-4" />,
    dot: "bg-rose-500",
    active:
      "data-[state=active]:bg-rose-500/15 data-[state=active]:text-rose-200 data-[state=active]:ring-rose-500/30",
  },
];

// --- normalização robusta das chaves vindas da API ---
function normalizeKey(raw: string): Exclude<StatusOS, "TODAS"> | null {
  if (!raw) return null;

  // remove acentos (Concluído -> CONCLUIDO), trim, maiúsculas
  let k = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

  // troca espaços por _
  k = k.replace(/\s+/g, "_");

  // sinônimos mais comuns
  const alias: Record<string, Exclude<StatusOS, "TODAS">> = {
    ABERTA: "ABERTO",
    EM_ANDAMENTO: "EM_ANDAMENTO",
    "EM-ANDAMENTO": "EM_ANDAMENTO",
    PAGTO: "PAGAMENTO",
    PAGAMENTOS: "PAGAMENTO",
    CONCLUIDA: "CONCLUIDO",
    CONCLUIDOS: "CONCLUIDO",
    CANCELADAS: "CANCELADO",
  };

  return (alias[k] ?? (k as any)) as Exclude<StatusOS, "TODAS">;
}

export function OrdensTabs({
  onOpenOrcamento,
  onEditar,
  onNovaOS,
}: {
  onOpenOrcamento: (row: any) => void;
  onEditar: (row: any) => void;
  onNovaOS: () => void;
}) {
  const [active, setActive] = useState<StatusOS>("TODAS");
  const [stats, setStats] = useState<Record<Exclude<StatusOS, "TODAS">, number>>({
    ABERTO: 0,
    EM_ANDAMENTO: 0,
    PAGAMENTO: 0,
    CONCLUIDO: 0,
    CANCELADO: 0,
  });
  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  // carrega contadores da API e normaliza as chaves
  const loadStats = async () => {
    try {
      const r = await fetch("/api/ordens/stats", { cache: "no-store" });
      const j = await r.json();

      // aceita vários formatos: { counters: {...} } | { stats: {...} } | { ... }
      const src: Record<string, any> =
        j?.counters ?? j?.stats ?? j ?? {};

      const next: Record<Exclude<StatusOS, "TODAS">, number> = {
        ABERTO: 0,
        EM_ANDAMENTO: 0,
        PAGAMENTO: 0,
        CONCLUIDO: 0,
        CANCELADO: 0,
      };

      for (const [rawKey, val] of Object.entries(src)) {
        const nk = normalizeKey(rawKey);
        if (!nk || next[nk] === undefined) continue;
        next[nk] += Number(val) || 0;
      }

      setStats(next);
    } catch (e) {
      // em caso de erro, zera para não mostrar valores "fantasmas"
      setStats({
        ABERTO: 0,
        EM_ANDAMENTO: 0,
        PAGAMENTO: 0,
        CONCLUIDO: 0,
        CANCELADO: 0,
      });
      console.error("Falha ao carregar stats de OS:", e);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Realtime: atualiza contadores ao mudar a tabela
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!url || !anon) return;

    const supabase = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const channel = supabase
      .channel("os-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "ordemservico" }, () => loadStats())
      .subscribe();

    // também escuta refresh local (ex.: após criar/editar)
    const onLocalRefresh = () => loadStats();
    window.addEventListener("os:refresh", onLocalRefresh);

    return () => {
      window.removeEventListener("os:refresh", onLocalRefresh);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Resumo compacto com valores corrigidos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <MiniCard accent="text-slate-300"   title="Total"        value={total}                 icon={<ClipboardList className="h-4 w-4" />} />
        <MiniCard accent="text-amber-300"   title="Aberto"       value={stats.ABERTO}          icon={<Wrench className="h-4 w-4" />} />
        <MiniCard accent="text-blue-300"    title="Em Andamento" value={stats.EM_ANDAMENTO}    icon={<Loader2 className="h-4 w-4" />} />
        <MiniCard accent="text-indigo-300"  title="Pagamento"    value={stats.PAGAMENTO}       icon={<CreditCard className="h-4 w-4" />} />
        <MiniCard accent="text-emerald-300" title="Concluído"    value={stats.CONCLUIDO}       icon={<CheckCircle2 className="h-4 w-4" />} />
        <MiniCard accent="text-rose-300"    title="Cancelado"    value={stats.CANCELADO}       icon={<XCircle className="h-4 w-4" />} />
      </div>

      <Tabs value={active} onValueChange={(v) => setActive(v as StatusOS)} className="w-full">
        <TabsList
          className={[
            "w-full overflow-x-auto justify-start gap-2",
            "rounded-lg px-1 py-1",
            "bg-muted/30 supports-[backdrop-filter]:bg-muted/25 backdrop-blur",
            "ring-1 ring-border",
          ].join(" ")}
        >
          {statusTabs.map((t) => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className={[
                "whitespace-nowrap px-3 py-1.5 rounded-md text-xs md:text-sm",
                "ring-1 ring-transparent transition-colors",
                "hover:bg-muted/50",
                t.active,
              ].join(" ")}
            >
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${t.dot}`} />
                {t.icon}
                <span>{t.label}</span>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {statusTabs.map((t) => (
          <TabsContent key={t.key} value={t.key} className="mt-3">
            <OrdensTabela
              status={t.key}
              onOpenOrcamento={onOpenOrcamento}
              onEditar={onEditar}
              onNovaOS={onNovaOS}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function MiniCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <Card className="bg-card">
      <CardContent className="p-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{title}</span>
          <span className={["[&>svg]:h-4 [&>svg]:w-4", accent].filter(Boolean).join(" ")}>{icon}</span>
        </div>
        <div className="text-xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
