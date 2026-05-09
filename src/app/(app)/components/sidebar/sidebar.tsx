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
  Car,
  Wrench,
  CalendarDays,
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
import { PERMS } from "@/app/api/_authz/permission-constants";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user?: { nome: string; email: string };
  setOpen?: (open: boolean) => void;
  hoverHabilitado?: boolean;
};

const data = {
  navOptions: [
    {
      title: "Execução",
      url: "/execucao",
      icon: Wrench,
      perm: PERMS.EXECUCAO_OS,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      perm: PERMS.DASHBOARD,
    },
    {
      title: "Clientes",
      url: "/clientes",
      icon: UsersRound,
      isActive: true,
      perm: PERMS.CLIENTES,
    },
    {
      title: "Ordens de Serviço",
      url: "/ordens",
      icon: NotepadText,
      isActive: true,
      perm: PERMS.ORDENS,
    },
    {
      title: "Agendamentos",
      url: "/agendamentos",
      icon: CalendarDays,
      perm: PERMS.AGENDAMENTOS,
    },
    {
      title: "Veículos",
      url: "/veiculos",
      icon: Car,
      perm: PERMS.VEICULOS,
    },
    {
      title: "Estoque",
      url: "/estoque",
      icon: Package,
      perm: PERMS.ESTOQUE,
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
          perm: PERMS.VENDAS,
        },
        {
          title: "Ponto de Venda",
          url: "/pdv",
          icon: Headset,
          perm: PERMS.VENDAS,
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
          perm: PERMS.FINANCEIRO,
        },
        {
          title: "Pagamento de Ordens",
          url: "/pagamentodeordens",
          icon: Calculator,
          perm: PERMS.FINANCEIRO,
        },
        {
          title: "Pagamento de Vendas",
          url: "/pagamentodevendas",
          icon: Handbag,
          perm: PERMS.FINANCEIRO,
        },
      ],
    },
    {
      title: "Acompanhamento",
      url: "/acompanhamento",
      icon: Tv,
      perm: PERMS.ACOMPANHAMENTO,
    },
    {
      title: "Relatórios",
      url: "/relatorios",
      icon: ClipboardList,
      perm: PERMS.RELATORIOS,
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
          url: "/configuracoes/geral",
          icon: Settings,
          perm: PERMS.CONFIG,
        },
        {
          title: "Fiscal & Pagamentos",
          url: "/configuracoes/fiscal-pagamentos",
          icon: Receipt,
          perm: PERMS.CONFIG,
        },
        {
          title: "Tipos",
          url: "/configuracoes/tipos",
          icon: Type,
          perm: PERMS.CONFIG,
        },

        {
          title: "Perfis & Permissões",
          url: "/configuracoes/perfis",
          icon: Lock,
          perm: PERMS.CONFIG,
        },
        {
          title: "Usuários",
          url: "/usuarios",
          icon: Users,
          perm: PERMS.USUARIOS,
        },
        {
          title: "Checklist",
          url: "/configuracoes/checklist",
          icon: SquareCheckBig,
          perm: PERMS.CONFIG,
        },
        {
          title: "Site",
          url: "#",
          icon: PanelsTopLeft,
          perm: PERMS.CONFIG,
        },
      ],
    },
  ],
};

function userHasPerm(user: any, perm?: string) {
  if (!perm) return true;
  const perms = Array.isArray(user?.permissoes) ? user.permissoes : [];
  return perms.map((p: any) => String(p).trim().toUpperCase()).includes(perm);
}

function filterByPermission(items: any[], user: any) {
  return items
    .map((item) => {
      if (Array.isArray(item.items)) {
        const subItems = item.items.filter((sub: any) => userHasPerm(user, sub.perm));
        return subItems.length ? { ...item, items: subItems } : null;
      }

      return userHasPerm(user, item.perm) ? item : null;
    })
    .filter(Boolean);
}

export function AppSidebar({ user, setOpen, hoverHabilitado, ...props }: AppSidebarProps) {
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

  const navOptions = React.useMemo(
    () => filterByPermission(data.navOptions, effectiveUser),
    [effectiveUser]
  );
  const navSettings = React.useMemo(
    () => filterByPermission(data.navSettings, effectiveUser),
    [effectiveUser]
  );

  return (
    <Sidebar onMouseOver={()=>{
      if(!hoverHabilitado) return;
      setOpen?.(true)}} collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={navOptions} />
        <NavSettings items={navSettings} />
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
