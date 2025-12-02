import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OeeChart } from "./components/oee-chart";
import { OperatorRankingChart } from "./components/operator-ranking-chart";
import { StopReasonsPieChart } from "./components/stop-reasons-pie-chart";
import { OperatorInputForm } from "./components/operator-input-form";
import { getMachineOEE, getOperatorProductivity, getStopReasonsSummary, getStopReasons } from "@/lib/shop-floor-data";
import { Monitor, Tablet } from "lucide-react";

export const metadata = {
  title: "Chão de Fábrica | FabriTrack",
};

export default function ShopFloorPage() {
  const oeeData = getMachineOEE();
  const operatorData = getOperatorProductivity();
  const stopReasonsSummary = getStopReasonsSummary();
  const stopReasons = getStopReasons();

  return (
    <>
      <PageHeader
        title="Monitoramento de Chão de Fábrica"
        description="Acompanhe a produção em tempo real e registre novas atividades."
      />
      <main className="px-4 sm:px-6 lg:px-8 pb-8">
        <Tabs defaultValue="supervisor" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
            <TabsTrigger value="supervisor">
              <Monitor className="mr-2" />
              Visão Supervisor
            </TabsTrigger>
            <TabsTrigger value="operator">
              <Tablet className="mr-2" />
              Modo Operador
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="supervisor">
            <div className="grid gap-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <OeeChart data={oeeData} />
                <OperatorRankingChart data={operatorData} />
                <StopReasonsPieChart data={stopReasonsSummary} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="operator">
             <Card className="max-w-2xl mx-auto mt-6">
                <CardHeader>
                    <CardTitle>Registro de Produção</CardTitle>
                    <CardDescription>Insira os dados de produção da sua atividade.</CardDescription>
                </CardHeader>
                <CardContent>
                    <OperatorInputForm stopReasons={stopReasons} />
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
