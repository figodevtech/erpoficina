"use client";

import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function NavUser({
  user,
}: {
  user: {
    nome: string;
    email: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1) Limpa sessão local do Supabase (se estiver usando no client)
      // Não é estritamente necessário se você não armazenou sessão no client,
      // mas é seguro chamar para garantir limpeza.
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.log(err)
        // não interrompe o fluxo se falhar — apenas logamos
        // console.debug("supabase signOut falhou:", err);
      }

      // 2) Faz signOut do NextAuth e depois redireciona manualmente
      // usamos redirect: false para controlar o redirecionamento pelo router
      await signOut({ redirect: false });

      // 3) Redireciona para a tela de login
      router.push("/login");
    } catch (err) {
      console.error("Erro ao finalizar sessão:", err);
      // opcional: mostrar toast / feedback ao usuário
      router.push("/login");
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.nome}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
               
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.nome}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Conta
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Bell />
                Notificações
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* aqui chamamos o handler */}
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              <LogOut />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
