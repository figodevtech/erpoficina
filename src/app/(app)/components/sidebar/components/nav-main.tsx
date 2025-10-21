"use client";

import * as React from "react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Item = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: { title: string; url: string; icon: LucideIcon }[];
};

// 🔧 Subcomponente para poder usar useId com segurança (e dar IDs estáveis)
function NavMainCollapsibleItem({
  item,
}: {
  item: Item & { items: NonNullable<Item["items"]> };
}) {
  const uid = React.useId();
  const contentId = `${uid}-content`;
  const router = useRouter();

  return (
    <Collapsible asChild defaultOpen={false} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger
          className="data-[state=open]:bg-primary data-[state=open]:hover:bg-primary"
          asChild
        >
          <SidebarMenuButton
            tooltip={item.title}
            className="hover:text-white transition-all hover:cursor-pointer hover:bg-primary"
            aria-controls={contentId} // <- estável
          >
            {item.icon ? <item.icon /> : null}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent id={contentId}>
          {" "}
          {/* <- estável */}
          <SidebarMenuSub>
            {item.items.map((sub) => (
              <SidebarMenuSubItem key={sub.title}>
                <SidebarMenuSubButton
                  onClick={() => router.push(sub.url)}
                  
                  className="hover:text-white transition-all hover:cursor-pointer hover:bg-primary"
                >
                  
                  
                  {sub.icon ? <sub.icon /> : null}
                  <span>{sub.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function NavMain({ items }: { items: Item[] }) {
  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Módulos</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.items ? (
            <NavMainCollapsibleItem key={item.title} item={item as any} />
          ) : (
            <SidebarMenuItem
              onClick={() => router.push(item.url)}
              key={item.title}
            >
              <SidebarMenuButton
                className="hover:text-white transition-all hover:cursor-pointer hover:bg-primary"
                tooltip={item.title}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
