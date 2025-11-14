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
} from "lucide-react";

import { NavMain } from "./components/nav-main";
import { NavUser } from "./components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarRail } from "@/components/ui/sidebar";
import { NavSettings } from "./components/nav-settings";

import { useSession } from "next-auth/react";

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
          url: "#",
          icon: History,
        },
         {
          title: "Ponto de Venda",
          url: "/pdv",
          icon: Headset,
        },
      ]
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
          title: "Assist. de Pagamentos",
          url: "/assistentepagamento",
          icon: Calculator,
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
          title: "Geral",
          url: "#",
          icon: Settings,
        },
        {
          title: "Fiscal & Pagamentos",
          url: "/configuracoes/fiscal-pagamentos",
          icon: Receipt,
        },
        {
          title: "Tipos",
          url: "#",
          icon: Type,
        },
        {
          title: "Usuários",
          url: "/usuarios",
          icon: Users,
        },
        {
          title: "Checklist",
          url: "/checklist",
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

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* <SidebarHeader className="items-center justify-center">
        <Image src={logoDemir} alt="Logo" width={130} height={40} />
      </SidebarHeader> */}
      <SidebarContent>
        <NavMain items={data.navOptions} />
        <NavSettings items={data.navSettings} />
      </SidebarContent>
      <SidebarFooter>
        {session?.user && (
          <NavUser
            user={{
              nome: session.user.nome || "",
              email: session.user.email || "",
            }}
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
