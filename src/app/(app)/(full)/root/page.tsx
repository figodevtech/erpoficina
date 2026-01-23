"use client"
import { DashboardHeader } from "./components/dashboard-header";
import { StatsCards } from "./components/cards-status";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Ordem } from "../../(pages)/ordens/types";
import { OrdensList } from "./components/ordens-lista";
import axios from "axios";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function Page() {
  const [ordens, setOrdens] = useState<Ordem[]>([]);

  // ✅ 1) Carrega um snapshot inicial (pra UPDATE começar a fazer sentido)
  useEffect(() => {
  const controller = new AbortController();

  async function carregarInicial() {
    try {
      const { data } = await axios.get<{ items: Ordem[] }>("/api/ordens/root", {
        params: { page: 1, limit: 50 }, // pega 50 (a API default é 10)
        signal: controller.signal,
      });

      setOrdens(data.items ?? []);
    } catch (err: any) {
      // se o componente desmontar, o abort cai aqui — só ignora
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;

      console.error("Erro ao buscar ordens:", err);
    }
  }

  void carregarInicial();

  return () => {
    controller.abort();
  };
}, []);

  // ✅ 2) Realtime com UPSERT no state (UPDATE também “entra” se não existir)
  useEffect(() => {
    const canalOs = supabase
      .channel("realtime:ordemservico")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ordemservico" },
        (payload) => {
          console.log("[REALTIME]", payload.eventType, payload);

          const tipo = payload.eventType;

          if (tipo === "INSERT" || tipo === "UPDATE") {
            const incoming = payload.new as Ordem;

            // soft delete
            if ((incoming as any).is_deleted) {
              setOrdens((atual) => atual.filter((o) => o.id !== incoming.id));
              return;
            }

            setOrdens((atual) => {
              const idx = atual.findIndex((o) => o.id === incoming.id);
              if (idx === -1) return [incoming, ...atual]; // ✅ entra no array
              const copia = [...atual];
              copia[idx] = incoming;
              return copia;
            });

            return;
          }

          if (tipo === "DELETE") {
            const antigo = payload.old as Partial<Ordem>;
            if (antigo?.id == null) return;
            setOrdens((atual) => atual.filter((o) => o.id !== antigo.id));
          }
        },
      )
      .subscribe((status) => {
        console.log("STATUS:", status); // SUBSCRIBED / CLOSED / CHANNEL_ERROR ...
      });

    return () => {
      supabase.removeChannel(canalOs);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-balance">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Acompanhe suas ordens de serviço em tempo real
          </p>
        </div>
        <StatsCards ordens={ordens} />
        <OrdensList ordens={ordens}/>
      </main>
    </div>
  );
}
