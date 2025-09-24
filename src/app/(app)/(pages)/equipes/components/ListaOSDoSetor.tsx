"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCcw, Search } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { OrdemServico } from "@/types/ordemservico";

type OSItem = {
  id: number;
  descricao: string | null;
  status: OrdemServico["status"];
  statusAprovacao: OrdemServico["statusaprovacao"];
  dataEntrada: string | null;
  dataSaidaPrevista: string | null;
  dataSaidaReal: string | null;
  criadorId: string;
  setor: { id: number; nome: string } | null;
  cliente: { id: number; nome: string } | null;
  veiculo: { id: number; placa: string; modelo: string; marca: string } | null;
};

const STATUS_VALORES = ["ABERTA", "EM_ANDAMENTO", "CONCLUIDA", "CANCELADA", "PENDENTE"] as const;
const STATUS_ROTULO: Record<string, string> = {
  ABERTA: "Aberta",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
  PENDENTE: "Pendente",
};

export function ListaOSDoSetor() {
  const [lookupLoading, setLookupLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [meuSetorId, setMeuSetorId] = useState<number | null>(null);
  const [meuSetorNome, setMeuSetorNome] = useState<string | null>(null);

  const [items, setItems] = useState<OSItem[]>([]);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<string | "">("");

  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subRef = useRef<ReturnType<typeof supabaseBrowser.channel> | null>(null);

  const carregarLookup = useCallback(async () => {
    setLookupLoading(true);
    const r = await fetch("/api/os/lookup", { cache: "no-store" });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || "Erro no lookup");
    setMeuSetorId(j.meuSetorId ?? null);
    setMeuSetorNome(j.meuSetor?.nome ?? null);
    setLookupLoading(false);
  }, []);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (busca.trim()) params.set("q", busca.trim());
    if (status) params.set("status", status);
    const r = await fetch(`/api/os?${params.toString()}`, { cache: "no-store" });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || "Erro ao listar OS");
    setItems(j.items ?? []);
    setLoading(false);
  }, [busca, status]);

  const agendarRefresh = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => { carregarDados().catch(() => {}); }, 500);
  }, [carregarDados]);

  // bootstrap
  useEffect(() => {
    (async () => {
      try { setErro(null); await carregarLookup(); }
      catch (e: any) { setErro(e?.message ?? "Erro no lookup"); }
    })();
  }, [carregarLookup]);

  useEffect(() => {
    if (!lookupLoading) {
      (async () => {
        try { setErro(null); await carregarDados(); }
        catch (e: any) { setErro(e?.message ?? "Erro ao carregar OS"); }
      })();
    }
  }, [lookupLoading, carregarDados]);

  // realtime: eventos só do meu setor
  useEffect(() => {
    if (!lookupLoading && meuSetorId) {
      if (subRef.current) { supabaseBrowser.removeChannel(subRef.current); subRef.current = null; }

      const ch = supabaseBrowser
        .channel(`os:setor:${meuSetorId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "ordemservico", filter: `setorid=eq.${meuSetorId}` },
          () => agendarRefresh()
        )
        .subscribe();

      subRef.current = ch;

      return () => {
        if (subRef.current) { supabaseBrowser.removeChannel(subRef.current); subRef.current = null; }
      };
    }
  }, [lookupLoading, meuSetorId, agendarRefresh]);

  const lista = useMemo(() => items, [items]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordens de Serviço</CardTitle>
        <CardDescription>
          {lookupLoading ? "Descobrindo seu setor…" : <>Seu setor: <b>{meuSetorNome ?? "-"}</b></>}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-4 w-4 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
            <Input
              className="pl-8"
              placeholder="Buscar por descrição"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && carregarDados()}
            />
          </div>

          <Select value={status} onValueChange={(v) => setStatus(v === "TODOS" ? "" : v)}>
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os status</SelectItem>
              {STATUS_VALORES.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_ROTULO[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={carregarDados} disabled={loading || lookupLoading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Atualizando…
              </span>
            ) : (
              <>
                <RefreshCcw className="h-4 w-4 mr-2" /> Atualizar
              </>
            )}
          </Button>
        </div>

        {erro && <div className="text-sm text-red-500 mb-3">{erro}</div>}

        {(loading || lookupLoading) ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando…
          </div>
        ) : lista.length === 0 ? (
          <div className="text-sm text-muted-foreground">Nenhuma OS encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">Cliente</th>
                  <th className="py-2 pr-2">Veículo</th>
                  <th className="py-2 pr-2">Descrição</th>
                  <th className="py-2 pr-2">Entrada</th>
                  <th className="py-2 pr-2">Prevista</th>
                  <th className="py-2 pr-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((os) => (
                  <tr key={os.id} className="border-b hover:bg-muted/30">
                    <td className="py-2 pr-2">{os.id}</td>
                    <td className="py-2 pr-2">{os.cliente?.nome ?? "-"}</td>
                    <td className="py-2 pr-2">
                      {os.veiculo ? `${os.veiculo.placa} • ${os.veiculo.modelo}` : "-"}
                    </td>
                    <td className="py-2 pr-2">{os.descricao ?? "-"}</td>
                    <td className="py-2 pr-2">{os.dataEntrada ? new Date(os.dataEntrada).toLocaleString() : "-"}</td>
                    <td className="py-2 pr-2">{os.dataSaidaPrevista ? new Date(os.dataSaidaPrevista).toLocaleString() : "-"}</td>
                    <td className="py-2 pr-2">
                      <Badge variant={os.status === "ABERTA" ? "secondary" : os.status === "EM_ANDAMENTO" ? "default" : "outline"}>
                        {os.status ? STATUS_ROTULO[os.status] ?? os.status : "-"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
