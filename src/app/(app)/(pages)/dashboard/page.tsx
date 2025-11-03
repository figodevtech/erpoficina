import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import TabsOptions from "./components/tabs";
import OverviewContent from "./components/overviewContent/index";
import UsersContent from "./components/usersContent";
import FinancialContent from "./components/financialContent";

export default function Dashboard() {
  return (
    <div className="w-full">
      

      <div className="flex gap-4">
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="bg-none gap-2">
            <TabsOptions />
          </TabsList>
      <Separator className="my-4" />


          <TabsContent value="geral">

            <OverviewContent />
          </TabsContent>
          <TabsContent value="usuarios">
            <UsersContent />
          </TabsContent>
          <TabsContent value="financeiro">
            <FinancialContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
