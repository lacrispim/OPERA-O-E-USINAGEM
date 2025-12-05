'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OeeChart } from "./components/oee-chart";
import { StopReasonsPieChart } from "./components/stop-reasons-pie-chart";
import { OperatorInputForm } from "./components/operator-input-form";
import { RecentEntriesTable } from "./components/recent-entries-table";
import { getRecentEntries as getInitialRecentEntries } from "@/lib/shop-floor-data";
import { Monitor, Tablet } from "lucide-react";
import type { OperatorProductionInput, ProductionLossInput, ProductionStatus, MachineOEE } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { LossInputForm } from './components/loss-input-form';
import { RecentLossesTable } from './components/recent-losses-table';
import { MachineHoursSummary } from './components/machine-hours-summary';


// OEE Calculation Constants
const TOTAL_AVAILABLE_TIME_SECONDS = 8 * 60 * 60; // 8 hours shift
const IDEAL_CYCLE_TIME_SECONDS = 25; // Ideal time to produce one part

export default function ShopFloorPage() {
  const { toast } = useToast();
  
  const [recentEntries, setRecentEntries] = useState<OperatorProductionInput[]>(getInitialRecentEntries());
  const [recentLosses, setRecentLosses] = useState<ProductionLossInput[]>([]);

  const stopReasonsSummary = useMemo(() => {
    if (!recentLosses.length) {
      return [{ name: "Nenhuma perda registrada", value: 1 }];
    }
    const summary: Record<string, number> = {};
    recentLosses.forEach(loss => {
      if (summary[loss.reason]) {
        summary[loss.reason] += loss.timeLostMinutes;
      } else {
        summary[loss.reason] = loss.timeLostMinutes;
      }
    });
    return Object.entries(summary).map(([name, value]) => ({ name, value }));
  }, [recentLosses]);

  const oeeData = useMemo(() => {
    const machineData: Record<string, { totalProduced: number, totalLost: number, productionTime: number, downTime: number }> = {};
    const machines = new Set([...recentEntries.map(e => e.machineId), ...recentLosses.map(l => l.machineId)]);

    machines.forEach(machineId => {
      machineData[machineId] = {
        totalProduced: 0,
        totalLost: 0,
        productionTime: 0,
        downTime: 0,
      };
    });

    recentEntries.forEach(entry => {
      if (machineData[entry.machineId]) {
        machineData[entry.machineId].totalProduced += entry.quantityProduced;
        machineData[entry.machineId].productionTime += entry.productionTimeSeconds;
      }
    });

    recentLosses.forEach(loss => {
      if (machineData[loss.machineId]) {
        machineData[loss.machineId].totalLost += loss.quantityLost;
        machineData[loss.machineId].downTime += loss.timeLostMinutes * 60;
      }
    });

    const oeeByMachine: MachineOEE[] = Object.entries(machineData).map(([machineId, data]) => {
      const plannedProductionTime = TOTAL_AVAILABLE_TIME_SECONDS - data.downTime;
      
      const availability = (plannedProductionTime / TOTAL_AVAILABLE_TIME_SECONDS) * 100;
      
      const performance = (data.totalProduced > 0)
        ? ((data.totalProduced * IDEAL_CYCLE_TIME_SECONDS) / data.productionTime) * 100
        : 0;

      const totalParts = data.totalProduced + data.totalLost;
      const quality = (totalParts > 0)
        ? (data.totalProduced / totalParts) * 100
        : 0;
      
      const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;
      
      return {
        machineId,
        oee: isNaN(oee) ? 0 : oee,
        availability: isNaN(availability) ? 0 : availability,
        performance: isNaN(performance) ? 0 : Math.min(performance, 100), // Performance can't exceed 100%
        quality: isNaN(quality) ? 0 : quality,
      };
    });
    
    return oeeByMachine;
  }, [recentEntries, recentLosses]);

  const handleRegisterProduction = async (newEntry: Omit<OperatorProductionInput, 'timestamp' | 'status'>) => {
    const entryWithTimestamp: OperatorProductionInput = {
      ...newEntry,
      timestamp: new Date().toISOString(),
      status: 'Em produção',
    };
    setRecentEntries(prevEntries => [entryWithTimestamp, ...prevEntries].slice(0, 50));
    
    toast({
      title: "Produção Registrada!",
      description: `${newEntry.quantityProduced} peças registradas para ${newEntry.operatorId}.`,
    });
  };

  const handleUpdateStatus = (index: number, newStatus: ProductionStatus) => {
    setRecentEntries(currentEntries => 
      currentEntries.map((entry, i) => 
        i === index ? { ...entry, status: newStatus } : entry
      )
    );
  };

  const handleDeleteProduction = (indexToDelete: number) => {
    setRecentEntries(prevEntries => prevEntries.filter((_, index) => index !== indexToDelete));
    toast({
      variant: 'destructive',
      title: "Registro Removido!",
      description: "O registro de produção foi removido.",
    });
  };

  const handleRegisterLoss = async (newLoss: Omit<ProductionLossInput, 'timestamp'>) => {
    const lossWithTimestamp: ProductionLossInput = {
        ...newLoss,
        timestamp: new Date().toISOString(),
    };
    setRecentLosses(prevLosses => [lossWithTimestamp, ...prevLosses].slice(0,50));
    
    toast({
        variant: 'destructive',
        title: "Perda Registrada!",
        description: `${newLoss.quantityLost} peças perdidas foram registradas.`,
    });
  }

  const handleDeleteLoss = (indexToDelete: number) => {
    setRecentLosses(prevLosses => prevLosses.filter((_, index) => index !== indexToDelete));
    toast({
        variant: 'destructive',
        title: "Registro de Perda Removido!",
        description: "O registro de perda foi removido.",
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
            <div className="grid gap-6 mt-6 max-w-7xl mx-auto">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <OeeChart data={oeeData} />
                <StopReasonsPieChart data={stopReasonsSummary} />
                <MachineHoursSummary entries={recentEntries} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="operator">
            <div className="max-w-7xl mx-auto mt-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <div className="space-y-8">
                    <RecentEntriesTable entries={recentEntries} onUpdateStatus={handleUpdateStatus} onDelete={handleDeleteProduction} />
                    <RecentLossesTable entries={recentLosses} onDelete={handleDeleteLoss} />
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
