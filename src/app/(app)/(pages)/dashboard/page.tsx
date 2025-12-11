// ./src/app/(app)/(pages)/dashboard/page.tsx
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";

import OpcoesAbas from "./components/tabs";
import ConteudoGeral from "./components/overviewContent";
import ConteudoUsuarios from "./components/dashboard-clientes/dashboard-clientes";
import ConteudoFinanceiro from "./components/dashboard-financeiro/dashboard-financeiro";

export default function PaginaDashboard() {
  return (
    <div className="w-full">
      <div className="flex gap-4">
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="bg-none gap-2">
            <OpcoesAbas />
          </TabsList>

          <Separator className="my-4" />

          <TabsContent value="geral">
            <ConteudoGeral />
          </TabsContent>

          <TabsContent value="usuarios">
            <ConteudoUsuarios />
          </TabsContent>

          <TabsContent value="financeiro">
            <ConteudoFinanceiro />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
