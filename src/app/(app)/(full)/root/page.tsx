"use client"
import { DashboardHeader } from "./components/dashboard-header";
import { StatsCards } from "./components/cards-status";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Ordem } from "../../(pages)/ordens/types";
import { OrdensList } from "./components/ordens-lista";
import axios from "axios";
import { Pagination } from "../../(pages)/veiculos/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function Page() {
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [activeTab, setActiveTab] = useState("abertas");
  const [isLoading, setIsLoading] = useState(false);

  const OPEN_STATUSES = [
    "AGUARDANDO_CHECKLIST",
    "ORCAMENTO",
    "ORCAMENTO_RECUSADO",
    "APROVACAO_ORCAMENTO",
    "ORCAMENTO_APROVADO",
    "EM_ANDAMENTO",
    "PAGAMENTO",
  ];

  const FINISHED_STATUSES = ["CONCLUIDO", "SEM_COBRANCA", "CANCELADO"];

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    pageCount: 0,
    totalPages: 0,
  });

  // Função para buscar ordens
  const fetchOrdens = async (page: number, limit: number, tabOverride?: string) => {
    setIsLoading(true);
    try {
      const currentTab = tabOverride ?? activeTab;
      const statuses =
        currentTab === "abertas" ? OPEN_STATUSES : FINISHED_STATUSES;

      const { data } = await axios.get<{ items: Ordem[], total: number, totalPages: number, pageCount: number }>("/api/ordens/root", {
        params: {
          page,
          limit,
          statuses: statuses.join(","),
        },
      });

      setOrdens(data.items ?? []);
      setPagination((prev) => ({
        ...prev,
        page,
        limit,
        total: data.total,
        totalPages: data.totalPages,
        pageCount: data.pageCount,
      }));
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
      console.error("Erro ao buscar ordens:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetOrdens = (page: number, limit: number) => {
    void fetchOrdens(page, limit);
  };

  // ✅ 1) Carrega um snapshot inicial (pra UPDATE começar a fazer sentido)
  // E recarrega quando muda a TAB (reseta para pagina 1)
  useEffect(() => {
    const controller = new AbortController();
    
    // Sempre que mudar a tab, reseta pra pagina 1
    void fetchOrdens(1, 50);

    return () => {
      controller.abort();
    };
  }, [activeTab]);

  // ✅ 2) Realtime com UPSERT no state (UPDATE também “entra” se não existir)
  useEffect(() => {
    const canalOs = supabase
      .channel("realtime:ordemservico")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ordemservico" },
        async (payload) => {
          console.log("[REALTIME]", payload.eventType, payload);

          const tipo = payload.eventType;
          const currentStatuses =
            activeTab === "abertas" ? OPEN_STATUSES : FINISHED_STATUSES;

          if (tipo === "INSERT" || tipo === "UPDATE") {
            const partial = payload.new as Ordem;
            if (!partial.id) return;

            // Busca os dados completos da API para ter os joins (cliente, veiculo, etc)
            try {
              const { data } = await axios.get<{ items: Ordem[] }>(
                "/api/ordens/root",
                {
                  params: {
                    q: String(partial.id),
                    limit: 1,
                    // Se quiser garantir que venha mesmo se status mudou, 
                    // talvez não devêssemos passar 'statuses' aqui. 
                    // O endpoint root filtra por statuses se passar params.
                    // Se não passar, vem "TODAS" se não mandar nada?
                    // O endpoint diz: const status = ... || "TODAS".
                    // Então sem params, busca em "TODAS".
                  },
                },
              );
              
              const incoming = data.items.find((o) => o.id === partial.id);

              // Se não achou na API (ex: soft deleted e a API filtra, ou algum erro), aborta
              if (!incoming) {
                 // Se foi soft delete no bando, pode ser que a API não retorne.
                 // Mas vamos checar is_deleted do payload primeiro.
                 if ((partial as any).is_deleted) {
                    setOrdens((atual) => atual.filter((o) => o.id !== partial.id));
                 }
                 return;
              }

              // soft delete check (caso venha no objeto completo também)
              if ((incoming as any).is_deleted) {
                setOrdens((atual) => atual.filter((o) => o.id !== incoming.id));
                return;
              }

              // Verifica se o status do incoming faz parte da tab atual
              const isValidForTab = currentStatuses.includes(
                incoming.status as string,
              );

              if (!isValidForTab) {
                // Se não for válido para a tab atual, removemos se existir
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

            } catch (err) {
              console.error("Erro ao buscar ordem atualizada via realtime:", err);
            }
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
  }, [activeTab]);

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
        <StatsCards />
        <OrdensList
        handleGetOrdens={handleGetOrdens}
        pagination={pagination}
          isLoading={isLoading}
          ordens={ordens}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </main>
    </div>
  );
}
