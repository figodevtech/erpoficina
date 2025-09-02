"use client"

import * as React from "react"
import {
  GalleryVerticalEnd,
<<<<<<< HEAD:src/app/(app)/components/sidebar/sidebar.tsx
  LayoutDashboard,
  NotepadText,
  Tv,
  Package,
=======
  Settings2,
  LayoutDashboard, 
  NotepadText,
  Tv,
>>>>>>> 2bf97629f2517745023c7231fb13526341de27b9:src/app/app/components/sidebar/sidebar.tsx
  ClipboardList,
  Settings2,
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

<<<<<<< HEAD:src/app/(app)/components/sidebar/sidebar.tsx
=======

>>>>>>> 2bf97629f2517745023c7231fb13526341de27b9:src/app/app/components/sidebar/sidebar.tsx
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
          url: "/app/usuarios",
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
<<<<<<< HEAD:src/app/(app)/components/sidebar/sidebar.tsx
  const { data: session } = useSession()
=======

>>>>>>> 2bf97629f2517745023c7231fb13526341de27b9:src/app/app/components/sidebar/sidebar.tsx

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
              avatar: session.user.image || "/avatars/default.png",
            }}
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
