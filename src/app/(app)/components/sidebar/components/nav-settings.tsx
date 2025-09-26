"use client";

import * as React from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

// Helper: renderiza filhos só após montar (SSR/1º render mostram fallback estável)
function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : <>{fallback}</>;
}

type Item = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
};

export function NavSettings({ items }: { items: Item[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Ajustes</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.items?.length;

          // Fallback: mesma altura/shape no SSR e 1º render
          const fallback = (
            <SidebarMenuItem key={`fallback-${item.title}`}>
              <SidebarMenuButton
                tooltip={undefined} // evita montar Tooltip/ids no 1º render
                className="hover:text-white transition-all hover:cursor-pointer hover:bg-primary justify-between opacity-90"
                aria-disabled
              >
                <div className="flex items-center gap-2">
                  {Icon ? <Icon /> : null}
                  <span>{item.title}</span>
                </div>
                {hasChildren ? (
                  <ChevronRight className="ml-auto transition-transform duration-200" />
                ) : null}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );

          return (
            <ClientOnly key={item.title} fallback={fallback}>
              {hasChildren ? (
                // ⚠️ defaultOpen fixo no 1º render (o open real só importa após montar)
                <Collapsible asChild defaultOpen={false} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        // tooltip só após mount (aqui estamos após mount)
                        tooltip={item.title}
                        className="hover:text-white transition-all hover:cursor-pointer hover:bg-primary"
                      >
                        {Icon ? <Icon /> : null}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items!.map((sub) => {
                          const SubIcon = sub.icon;
                          return (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuSubButton
                                asChild
                                className="hover:text-white transition-all hover:cursor-pointer hover:bg-primary"
                              >
                                <a href={sub.url}>
                                  {SubIcon ? <SubIcon /> : null}
                                  <span>{sub.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="hover:text-white transition-all hover:cursor-pointer hover:bg-primary"
                  >
                    <a href={item.url}>
                      {Icon ? <Icon /> : null}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </ClientOnly>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
