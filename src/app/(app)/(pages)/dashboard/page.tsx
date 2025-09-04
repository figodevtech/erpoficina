import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import TabsOptions from "./components/tabs";
import OverviewContent from "./components/overviewContent/index";
import UsersContent from "./components/usersContent";
import FinancialContent from "./components/financialContent";

export default function Dashboard() {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      </div>
      <Separator className="my-4" />

      <div className="flex gap-4">
        <Tabs defaultValue="geral" className="">
          <TabsList className="bg-none gap-2">
            <TabsOptions />
          </TabsList>


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
