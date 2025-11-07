"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import DateTimeBadge from "./date-time-badge";
import { ModeToggle } from "./mode-toggle";

/* Títulos por rota + fallback */
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

export default function AppHeaderBar() {
  const pathname = usePathname();
  const title = routeTitles[pathname] ?? humanize(pathname);

  return (
    <header className="flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <h2 className="text-base md:text-lg font-medium text-foreground/80">{title}</h2>
      <div className="flex-1" />

      <DateTimeBadge />
      <ModeToggle />
    </header>
  );
}
