// /src/app/(app)/ClientAppShell.tsx
"use client";

import * as React from "react";
import { AppSidebar } from "./components/sidebar/sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "./components/mode-toggle";
import DateTimeBadge from "./components/date-time-badge";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";

/* ============================
 * Títulos por rota + fallback
 * ============================ */
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
  "/assistentepagamento": "Assistente de Pagamento",
  "/acompanhamento": "Acompanhamento",
  "/configuracoes/fiscal-pagamentos": "Configurações Fiscais e de Pagamentos",
  "/checklist": "Gerenciamento de Checklists",
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
  user,
  children,
}: {
  user: { nome: string; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = routeTitles[pathname] ?? humanize(pathname);

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar user={user} />

      {/* ✅ min-w-0 evita overflow no conteúdo flex */}
      <SidebarInset className="flex min-h-screen min-w-0">
        <header className="flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

          <h2 className="text-base md:text-lg font-medium text-foreground/80">{title}</h2>
          <div className="flex-1" />

          <DateTimeBadge />
          <ModeToggle />
        </header>

        {/* ✅ min-w-0 permite o main encolher; container centralizado e paddings */}
        <main className="flex-1 min-w-0 bg-blue-600/5 dark:bg-muted-foreground/5">
          <div className="mx-auto w-full px-4 md:px-6 py-4 md:py-6">
            {children}
            {/* Monte o Toaster apenas no layout privado para evitar duplicidade */}
            <Toaster richColors position="bottom-right" />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
