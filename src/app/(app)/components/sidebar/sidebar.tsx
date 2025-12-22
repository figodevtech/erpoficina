// src/app/(app)/components/sidebar/sidebar.tsx
"use client";

import * as React from "react";
import {
  LayoutDashboard,
  NotepadText,
  Tv,
  Package,
  Settings2,
  ClipboardList,
  Users,
  PanelsTopLeft,
  Type,
  Settings,
  UsersRound,
  SquareCheckBig,
  DollarSign,
  Calculator,
  ArrowDownUp,
  Receipt,
  Store,
  Headset,
  History,
  Handbag,
  Lock,
} from "lucide-react";

import { NavMain } from "./components/nav-main";
import { NavUser } from "./components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavSettings } from "./components/nav-settings";

import { useSession } from "next-auth/react";
import { title } from "process";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user?: { nome: string; email: string };
};

const data = {
  navOptions: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Clientes",
      url: "/clientes",
      icon: UsersRound,
      isActive: true,
    },
    {
      title: "Ordens de Serviço",
      url: "/ordens",
      icon: NotepadText,
      isActive: true,
    },
    {
      title: "Estoque",
      url: "/estoque",
      icon: Package,
    },
    {
      title: "Vendas",
      url: "#",
      icon: Store,
      isActive: true,
      items: [
        {
          title: "Histórico",
          url: "/historicovendas",
          icon: History,
        },
        {
          title: "Ponto de Venda",
          url: "/pdv",
          icon: Headset,
        },
      ],
    },
    {
      title: "Financeiro",
      url: "#",
      icon: DollarSign,
      isActive: true,
      items: [
        {
          title: "Fluxo de Caixa",
          url: "/fluxodecaixa",
          icon: ArrowDownUp,
        },
        {
          title: "Pagamento de Ordens",
          url: "/pagamentodeordens",
          icon: Calculator,
        },
        {
          title: "Pagamento de Vendas",
          url: "/pagamentodevendas",
          icon: Handbag,
        },
      ],
    },
    {
      title: "Acompanhamento",
      url: "/acompanhamento",
      icon: Tv,
    },
    {
      title: "Relatórios",
      url: "/relatorios",
      icon: ClipboardList,
    },
  ],
  navSettings: [
    {
      title: "Configurações",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Fiscal & Pagamentos",
          url: "/configuracoes/fiscal-pagamentos",
          icon: Receipt,
        },
        {
          title: "Tipos",
          url: "/configuracoes/tipos",
          icon: Type,
        },

        {
          title: "Perfis & Permissões",
          url: "/configuracoes/perfis",
          icon: Lock,
        },
        {
          title: "Usuários",
          url: "/usuarios",
          icon: Users,
        },
        {
          title: "Checklist",
          url: "/configuracoes/checklist",
          icon: SquareCheckBig,
        },
        {
          title: "Site",
          url: "#",
          icon: PanelsTopLeft,
        },
      ],
    },
  ],
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { data: session } = useSession();

  // Se tiver sessão, usa usuário da sessão; senão, usa o user vindo por props (do layout)
  const effectiveUser =
    (session?.user as any) ??
    (user
      ? {
          nome: user.nome,
          email: user.email,
        }
      : null);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navOptions} />
        <NavSettings items={data.navSettings} />
      </SidebarContent>
      <SidebarFooter>
        {effectiveUser && (
          <NavUser
            user={{
              nome: effectiveUser.nome || "",
              email: effectiveUser.email || "",
            }}
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
