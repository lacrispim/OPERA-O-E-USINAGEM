'use client';

import { useState } from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OeeChart } from "./components/oee-chart";
import { OperatorRankingChart } from "./components/operator-ranking-chart";
import { StopReasonsPieChart } from "./components/stop-reasons-pie-chart";
import { OperatorInputForm } from "./components/operator-input-form";
import { RecentEntriesTable } from "./components/recent-entries-table";
import { getMachineOEE, getOperatorProductivity, getStopReasonsSummary, getStopReasons, getRecentEntries as getInitialRecentEntries } from "@/lib/shop-floor-data";
import { Monitor, Tablet } from "lucide-react";
import type { OperatorProductionInput } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


export default function ShopFloorPage() {
  const { toast } = useToast();
  const oeeData = getMachineOEE();
  const operatorData = getOperatorProductivity();
  const stopReasonsSummary = getStopReasonsSummary();
  const stopReasons = getStopReasons();
  
  const [recentEntries, setRecentEntries] = useState<OperatorProductionInput[]>(getInitialRecentEntries());

  const handleRegisterProduction = (newEntry: Omit<OperatorProductionInput, 'timestamp'>) => {
    const entryWithTimestamp: OperatorProductionInput = {
      ...newEntry,
      timestamp: new Date().toISOString(),
    };
    setRecentEntries(prevEntries => [entryWithTimestamp, ...prevEntries]);
    
    toast({
      title: "Registro salvo!",
      description: `Produção registrada com sucesso para o operador ${newEntry.operatorId}.`,
    });
  };


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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Registro de Produção</CardTitle>
                        <CardDescription>Insira os dados de produção da sua atividade.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OperatorInputForm stopReasons={stopReasons} onRegister={handleRegisterProduction} />
                    </CardContent>
                </Card>
                <RecentEntriesTable entries={recentEntries} stopReasons={stopReasons} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
