"use client"

import * as React from "react"
import {
  GalleryVerticalEnd,
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
  UserPlus,
} from "lucide-react"

import { NavMain } from "./components/nav-main"
import { NavUser } from "./components/nav-user"
import { TeamSwitcher } from "./components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavSettings } from "./components/nav-settings"

import { useSession } from "next-auth/react"

const data = {
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
      url: "/dashboard",
      icon: LayoutDashboard,
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
      title: "Acompanhamento",
      url: "/acompanhamento",
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
          url: "/usuarios",
          icon: Users,
        },
        {
          title: "Site",
          url: "#",
          icon: PanelsTopLeft,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { data: session } = useSession()


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
        {session?.user && (
          <NavUser
            user={{
              nome: session.user.nome || "Usuário",
              email: session.user.email || "",
              avatar: session.user.image || undefined,
            }}
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
