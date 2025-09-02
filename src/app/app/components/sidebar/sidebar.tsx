"use client";

import * as React from "react";
import {
  GalleryVerticalEnd,
  Settings2,
  LayoutDashboard, 
  NotepadText,
  Tv,
  ClipboardList,
  Users,
  PanelsTopLeft,
  Package,
  Type,
  Settings
} from "lucide-react";

import { NavMain } from "./components/nav-main";
import { NavUser } from "./components/nav-user";
import { TeamSwitcher } from "./components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavSettings } from "./components/nav-settings";


const data = {
  user: {
    name: "Nome Usuário",
    email: "usuário@email.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "EmpresaNome",
      logo: GalleryVerticalEnd,
      plan: "Plano Premium",
    },
  ],


  navOptions: [
    {
      title: "Dashboard",
      url: "/app/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      
    },
    {
      title: "Ordens de Serviço",
      url: "/app/ordens",
      icon: NotepadText,
      isActive: true,
      
    },
    {
      title: "Estoque",
      url: "/app/estoque",
      icon: Package,
    },
    {
      title: "Acompanhamento",
      url: "/app/acompanhamento",
      icon: Tv,
    },
    {
      title: "Relatórios",
      url: "#",
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
          title: "Tipos",
          url: "#",
          icon: Type,
        },
        {
          title: "Usuários",
          url: "#",
          icon: Users,
        },
        {
          title: "Site",
          url: "#",
          icon: PanelsTopLeft,
        },
      ],
    },
  ]

};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navOptions} />
        <NavSettings items={data.navSettings} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
