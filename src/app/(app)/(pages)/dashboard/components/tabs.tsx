import { TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DollarSign, LayoutDashboard, UsersIcon } from "lucide-react";

export default function TabsOptions() {
  const tabTheme =
    " dark:data-[state=active]:bg-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <TabsTrigger
              value="geral"
              className={"hover:cursor-pointer" + tabTheme}
            >
              <LayoutDashboard className="h-4 w-4" />
            </TabsTrigger>
          </span>
        </TooltipTrigger>
        <TooltipContent>Visão Geral</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <TabsTrigger
              value="usuarios"
              className={"hover:cursor-pointer" + tabTheme}
            >
              <UsersIcon className="h-4 w-4" />
            </TabsTrigger>
          </span>
        </TooltipTrigger>
        <TooltipContent>Clientes</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <TabsTrigger
              value="financeiro"
              className={"hover:cursor-pointer" + tabTheme}
            >
              <DollarSign className="h-4 w-4" />
            </TabsTrigger>
          </span>
        </TooltipTrigger>
        <TooltipContent>Financeiro</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
