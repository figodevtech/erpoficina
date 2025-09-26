"use client";

import * as React from "react";
import { AppSidebar } from "./components/sidebar/sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "./components/mode-toggle";
import Clock from "@/app/(app)/components/clock";
import { Toaster } from "@/components/ui/sonner";

/** Renderiza a data SOMENTE após montar no cliente
 *  para evitar divergência entre SSR e cliente. */
function DateLabel() {
  const [dateStr, setDateStr] = React.useState<string | null>(null);

  React.useEffect(() => {
    const now = new Date();
    // Usa timezone do navegador; evita cálculo no SSR
    const s = now.toLocaleDateString("pt-BR", {
      year: "numeric",
      weekday: "long",
      month: "long",
      day: "numeric",
      // opcional: garante coerência com o fuso local do usuário
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    setDateStr(s);
  }, []);

  // Enquanto não montar, não renderiza texto (evita mismatch)
  if (!dateStr) return <span className="hidden md:block text-sm text-gray-500" aria-hidden="true">&nbsp;</span>;
  return <span className="hidden md:block text-sm text-gray-500">{dateStr}</span>;
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // 🔒 Defina um default estável para o 1º render (igual no SSR e cliente)
    // e deixe a responsividade (matchMedia) para dentro do próprio Provider via useEffect.
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />

      {/* ✅ min-w-0 evita overflow no conteúdo flex */}
      <SidebarInset className="flex min-h-screen min-w-0">
        <header className="flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

          <Clock />

          <div className="flex-1" />

          {/* ❌ REMOVIDO new Date() no render; ✅ usamos DateLabel */}
          <DateLabel />

          <ModeToggle />
        </header>

        {/* ✅ min-w-0 permite o main encolher; container centralizado e paddings */}
        <main className="flex-1 min-w-0 bg-blue-600/5 dark:bg-muted-foreground/5">
          <div className="mx-auto w-full px-4 md:px-6 py-4 md:py-6">
            {children}
            <Toaster richColors />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
