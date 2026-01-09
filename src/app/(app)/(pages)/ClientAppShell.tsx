// src/app/(app)/ClientAppShell.tsx
"use client";

import * as React from "react";
import { AppSidebar } from "../components/sidebar/sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "../components/mode-toggle";
import DateTimeBadge from "../components/date-time-badge";
import { usePathname } from "next/navigation";
import { Config } from "./type";
import { toast } from "sonner";
import { useConfig } from "./config-context";

const routeTitles: Record<string, string> = {
  "/": "Início",
  "/usuarios": "Gerenciamento de Usuários",
  "/estoque": "Gerenciamento de Estoque",
  "/config": "Configurações",
  "/ordens": "Gerenciamento de Ordens de Serviço",
  "/clientes": "Gerenciamento de Clientes",
  "/equipes": "Acompanhamento de Equipes",
  "/financeiro": "Financeiro",
  "/fluxodecaixa": "Fluxo de Caixa",
  "/pagamentodeordens": "Assistente de Pagamento",
  "/pagamentodevendas": "Assistente de Pagamento",
  "/acompanhamento": "Acompanhamento",
  "/configuracoes/fiscal-pagamentos": "Configurações Fiscais e de Pagamentos",
  "/checklist": "Gerenciamento de Checklists",
  "/nao-autorizado": "Acesso não autorizado",
  "/configuracoes/tipos": "Configurações de Tipos",
  "/historicovendas": "Histórico de Vendas",
  "/configuracoes/perfis": "Perfis de Permissões",
};

function humanize(path: string) {
  const clean = path.split("?")[0].split("#")[0];
  const seg = clean.split("/").filter(Boolean)[0] ?? "";
  if (!seg) return "Início";

  const dic: Record<string, string> = {
    ordens: "Ordens de Serviço",
    assistentepagamento: "Assistente de Pagamento",
    fluxodecaixa: "Fluxo de Caixa",
    usuarios: "Gerenciamento de Usuários",
    estoque: "Gerenciamento de Estoque",
    clientes: "Gerenciamento de Clientes",
    equipes: "Acompanhamento de Equipes",
    financeiro: "Financeiro",
    acompanhamento: "Acompanhamento",
    config: "Configurações",
  };

  return dic[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
}

export default function ClientAppShell({
  children,
  hideHeader = false,
}: {
  children: React.ReactNode;
  hideHeader?: boolean;
}) {
  const pathname = usePathname();
  const title = routeTitles[pathname] ?? humanize(pathname);

  const [sideBarOpen, setSidebarOpen] = React.useState(true);
  const [hoverHabilitado, setHoverHabilitado] = React.useState(true);
  const hoverTimerRef = React.useRef<number | null>(null);
  const config = useConfig();

  React.useEffect(() => {
    // limpa timer anterior se trocar de rota rápido
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    const isOrdens = pathname === "/ordens" || pathname.startsWith("/ordens/");

    if (isOrdens) {
      setSidebarOpen(false);

      // bloqueia hover por 1s (tempo da animação de fechar)
      setHoverHabilitado(false);
      hoverTimerRef.current = window.setTimeout(() => {
        setHoverHabilitado(true);
      }, 1000);
    } else {
      // fora de ordens, deixa normal
      setHoverHabilitado(true);
    }

    return () => {
      if (hoverTimerRef.current) {
        window.clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
    };
  }, [pathname]);

  React.useEffect(() => {
    if (!config?.aviso_pagamento) return;
    toast.warning(
      <div>
        <span className="text-xs text-center">Pagamento pendente, contate o time da FIGO</span>
      </div>,
      {
        richColors: true,
        closeButton: false,
        duration: 999999999,
        position: "bottom-center",
        dismissible: false,
      }
    );
  }, [config?.aviso_pagamento]);

  return (
    <SidebarProvider open={sideBarOpen} onOpenChange={setSidebarOpen}>
      <AppSidebar hoverHabilitado={hoverHabilitado} setOpen={setSidebarOpen} />

      <SidebarInset className="flex min-h-screen min-w-0">
        {!hideHeader ? (
          <header className="flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

            <h2 className="text-base md:text-lg font-medium text-foreground/80">{title}</h2>
            <div className="flex-1" />

            <DateTimeBadge />
            <ModeToggle />
          </header>
        ) : (
          // ✅ quando não tem header, mostra um trigger flutuante no mobile
          <div className="md:hidden fixed left-3 top-3 z-50">
            <SidebarTrigger className="h-10 w-10 rounded-md border bg-background/90 shadow-sm backdrop-blur" />
          </div>
        )}

        {/* teste */}

        <main className="flex-1 min-w-0 bg-blue-600/5 dark:bg-muted-foreground/5">
          {/* se estiver sem header, adiciona padding-top pra não ficar “por baixo” do trigger flutuante */}
          <div className={`mx-auto w-full px-4 md:px-6 py-4 md:py-6 ${hideHeader ? "pt-14" : ""}`}>{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
