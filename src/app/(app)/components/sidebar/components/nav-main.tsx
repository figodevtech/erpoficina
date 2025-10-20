"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

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
import { useRouter } from "next/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      icon: LucideIcon
      }[];
  }[];
}) {

  const router = useRouter();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Módulos</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          item.items ? (
          <Collapsible key={item.title} asChild defaultOpen={false} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger className="data-[state=open]:bg-primary data-[state=open]:hover:bg-primary" asChild>
                      <SidebarMenuButton 
                        // tooltip só após mount (aqui estamos após mount)
                        tooltip={item.title}
                        className="hover:text-white transition-all hover:cursor-pointer hover:bg-primary"
                      >
                        {item.icon ? <item.icon /> : null}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items!.map((sub) => {
                          return (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuSubButton
                                asChild
                                className="hover:text-white transition-all hover:cursor-pointer hover:bg-primary"
                              >
                                <a href={sub.url}>
                                  {sub.icon && <sub.icon />}
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
          ): (

          <SidebarMenuItem onClick={()=>router.push(item.url)}  key={item.title}>
            <SidebarMenuButton className="hover:text-white transition-all hover:cursor-pointer hover:bg-primary" tooltip={item.title}>
              {item.icon && <item.icon />}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          )
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
