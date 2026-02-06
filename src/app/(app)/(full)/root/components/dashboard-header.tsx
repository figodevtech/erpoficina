"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search, Plus, Settings, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function DashboardHeader() {
  const router = useRouter();

  const handleLogout = async () => {
      try {
        try {
          await supabase.auth.signOut();
        } catch {}
        await signOut({ redirect: false });
        router.push("/login");
      } catch {
        router.push("/login");
      }
    };
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">OS</span>
            </div>
            <span className="font-semibold text-lg hidden sm:inline">
              Sistema OS
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-foreground">
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Ordens
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Clientes
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Relatórios
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar OS, cliente..."
              className="w-64 pl-9 bg-secondary/50 border-border/50 focus:bg-secondary"
            />
          </div>

          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova OS</span>
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
            <span className="sr-only">Notificações</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    AD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">
                    admin@empresa.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
