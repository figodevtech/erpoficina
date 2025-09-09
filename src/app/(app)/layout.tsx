"use client";
import { AppSidebar } from "./components/sidebar/sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "./components/mode-toggle";
import Clock from "@/app/(app)/components/clock"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <SidebarProvider>
  <AppSidebar />

  <SidebarInset className="flex min-h-screen">
    <header className="flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      {/* <Breadcrumb>
        <BreadcrumbList className="hidden md:flex overflow-x-auto whitespace-nowrap">
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>Data Fetching</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb> */}
      <Clock/>
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

    <main className="flex-1 p-4 md:p-6 bg-muted-foreground/5 overflow-x-hidden">
      <div className="mx-auto w-full">
        {children}
      </div>
    </main>
  </SidebarInset>
</SidebarProvider>

  );
}
