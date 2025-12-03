'use client';

import { useState } from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OeeChart } from "./components/oee-chart";
import { StopReasonsPieChart } from "./components/stop-reasons-pie-chart";
import { OperatorInputForm } from "./components/operator-input-form";
import { RecentEntriesTable } from "./components/recent-entries-table";
import { getMachineOEE, getStopReasonsSummary, getRecentEntries as getInitialRecentEntries } from "@/lib/shop-floor-data";
import { Monitor, Tablet } from "lucide-react";
import type { OperatorProductionInput, ProductionLossInput } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { LossInputForm } from './components/loss-input-form';


export default function ShopFloorPage() {
  const { toast } = useToast();
  const oeeData = getMachineOEE();
  const stopReasonsSummary = getStopReasonsSummary();
  
  const [recentEntries, setRecentEntries] = useState<OperatorProductionInput[]>(getInitialRecentEntries());
  const [recentLosses, setRecentLosses] = useState<ProductionLossInput[]>([]);

  const handleRegisterProduction = async (newEntry: Omit<OperatorProductionInput, 'timestamp' | 'productionTimeSeconds'>) => {
    // This function will be properly implemented in a future step
    // For now, we'll just show a success message and add to a local state
    const entryWithTimestamp: OperatorProductionInput = {
      ...newEntry,
      productionTimeSeconds: 0, // Placeholder
      timestamp: new Date().toISOString(),
    };
    setRecentEntries(prevEntries => [entryWithTimestamp, ...prevEntries].slice(0, 10));
    
    toast({
      title: "Produção Registrada!",
      description: `${newEntry.quantityProduced} peças registradas para ${newEntry.operatorId}.`,
    });
  };

  const handleRegisterLoss = async (newLoss: Omit<ProductionLossInput, 'timestamp'>) => {
    const lossWithTimestamp: ProductionLossInput = {
        ...newLoss,
        timestamp: new Date().toISOString(),
    };
    setRecentLosses(prevLosses => [lossWithTimestamp, ...prevLosses]);
    
    toast({
        variant: 'destructive',
        title: "Perda Registrada!",
        description: `${newLoss.quantityLost} peças perdidas foram registradas.`,
    });
  }


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
            <div className="grid gap-6 mt-6 max-w-7xl mx-auto">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                <OeeChart data={oeeData} />
                <StopReasonsPieChart data={stopReasonsSummary} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="operator">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mt-6">
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registro de Produção</CardTitle>
                            <CardDescription>Insira os dados de produção da sua atividade.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OperatorInputForm onRegister={handleRegisterProduction} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Registro de Perda</CardTitle>
                            <CardDescription>Registre peças perdidas e o tempo de inatividade.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <LossInputForm onRegister={handleRegisterLoss} />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <RecentEntriesTable entries={recentEntries} />
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
