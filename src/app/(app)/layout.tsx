"use client";
import { useEffect, useState } from "react";
import { Header } from "./components/header";
import { AppSidebar } from "./components/sidebar/sidebar";
import { useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "./components/mode-toggle";

interface User {
  id: string;
  name: string;
  email: string;
  profileType: string;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const router = useRouter();
  const [pageTitle, setPageTitle] = useState("Dashboard");

  useEffect(() => {
    console.log(user);
  }, [user]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList className=" flex-nowrap text-nowrap">
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="w-full"></div>
          <span className="hidden md:block text-sm text-gray-500 text-nowrap">
            {new Date().toLocaleDateString("pt-BR", {
              year: "numeric",
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
          <ModeToggle />
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>

        <div className="flex flex-1 flex-col gap-4 p-4 bg-muted-foreground/5">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
