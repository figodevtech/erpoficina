"use client";
import { AppSidebar } from "./components/sidebar/sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "./components/mode-toggle";
import Clock from "@/app/(app)/components/clock";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />

      {/* ✅ min-w-0 evita overflow no conteúdo flex */}
      <SidebarInset className="flex min-h-screen min-w-0">
        <header className="flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

          <Clock />

          <div className="flex-1" />

          <span className="hidden md:block text-sm text-gray-500">
            {new Date().toLocaleDateString("pt-BR", {
              year: "numeric",
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>

          <ModeToggle />
        </header>

        {/* ✅ min-w-0 permite o main encolher; container centralizado e paddings */}
        <main className="flex-1 min-w-0 bg-muted-foreground/5">
          <div className="mx-auto w-full px-4 md:px-6 py-4 md:py-6">
            {/* ⚠️ Se alguma página precisar rolar horizontalmente (ex.: tabelas),
                faça o overflow-x no componente interno, não aqui no main */}
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
