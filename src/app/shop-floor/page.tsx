'use client';

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Monitor, Tablet } from "lucide-react";
import { OperatorInputForm } from "./components/operator-input-form";
import { LossInputForm } from "./components/loss-input-form";
import { RecentEntriesTable } from "./components/recent-entries-table";
import { RecentLossesTable } from "./components/recent-losses-table";
import { OeeChart } from "./components/oee-chart";
import { StopReasonsPieChart } from "./components/stop-reasons-pie-chart";
import { MonthlyHoursChart } from "./components/monthly-hours-chart";
import type { OperatorProductionInput, ProductionLossInput } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { useFirestore } from "@/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";


const TOTAL_MONTHLY_HOURS = 540;
const TOTAL_AVAILABLE_TIME_SECONDS = 8 * 60 * 60; // 8 hours shift
const IDEAL_CYCLE_TIME_SECONDS = 25; // Ideal time to produce one part


export default function ShopFloorPage() {
    const firestore = useFirestore();
    const [recentEntries, setRecentEntries] = useState<OperatorProductionInput[]>([]);
    const [recentLosses, setRecentLosses] = useState<ProductionLossInput[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!firestore) return;

        setIsLoading(true);

        const entriesQuery = query(collection(firestore, "production-entries"), orderBy("timestamp", "desc"), limit(500));
        const entriesUnsubscribe = onSnapshot(entriesQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OperatorProductionInput));
            setRecentEntries(data);
            setIsLoading(false);
        });

        const lossesQuery = query(collection(firestore, "production-losses"), orderBy("timestamp", "desc"), limit(200));
        const lossesUnsubscribe = onSnapshot(lossesQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionLossInput));
            setRecentLosses(data);
        });

        return () => {
            entriesUnsubscribe();
            lossesUnsubscribe();
        };
    }, [firestore]);


  const { stopReasonsSummary, totalLostMinutes } = useMemo(() => {
    if (!recentLosses || recentLosses.length === 0) {
      return { stopReasonsSummary: [{ name: "Nenhuma perda registrada", value: 1 }], totalLostMinutes: 0 };
    }
    const summary: Record<string, number> = {};
    let totalMinutes = 0;
    recentLosses.forEach(loss => {
      const minutes = loss.timeLostMinutes || 0;
      if (summary[loss.reason]) {
        summary[loss.reason] += minutes;
      } else {
        summary[loss.reason] = minutes;
      }
      totalMinutes += minutes;
    });
    
    const summaryArray = Object.entries(summary).map(([name, value]) => ({ name, value }));
    return { stopReasonsSummary: summaryArray, totalLostMinutes: totalMinutes };
  }, [recentLosses]);

  const { oeeData, totalUsedHours } = useMemo(() => {
    const machineData: Record<string, { totalProduced: number, totalLost: number, productionTime: number, downTime: number }> = {};
    
    const entries = recentEntries || [];
    const losses = recentLosses || [];

    const machines = new Set([...entries.map(e => e.machineId), ...losses.map(l => l.machineId)]);

    machines.forEach(machineId => {
      if (!machineId) return;
      machineData[machineId] = {
        totalProduced: 0,
        totalLost: 0,
        productionTime: 0,
        downTime: 0,
      };
    });

    let usedSeconds = 0;
    entries.forEach(entry => {
      usedSeconds += entry.productionTimeSeconds;
      if (machineData[entry.machineId]) {
        machineData[entry.machineId].totalProduced += entry.quantityProduced;
        if(machineData[entry.machineId].productionTime) {
            machineData[entry.machineId].productionTime += entry.productionTimeSeconds;
        } else {
            machineData[entry.machineId].productionTime = entry.productionTimeSeconds;
        }
      }
    });

    losses.forEach(loss => {
      if (machineData[loss.machineId]) {
        machineData[loss.machineId].totalLost += loss.quantityLost;
        if(machineData[loss.machineId].downTime) {
            machineData[loss.machineId].downTime += loss.timeLostMinutes * 60;
        } else {
            machineData[loss.machineId].downTime = loss.timeLostMinutes * 60;
        }
      }
    });

    const oeeByMachine: any[] = Object.entries(machineData).map(([machineId, data]) => {
      const plannedProductionTime = TOTAL_AVAILABLE_TIME_SECONDS - data.downTime;
      
      const availability = (plannedProductionTime / TOTAL_AVAILABLE_TIME_SECONDS) * 100;
      
      const performance = (data.totalProduced > 0 && data.productionTime > 0)
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
    
    return {
      oeeData: oeeByMachine,
      totalUsedHours: usedSeconds / 3600
    };
  }, [recentEntries, recentLosses]);


  return (
    <>
      <PageHeader
        title="Registro de Produção"
        description="Monitore a produção, registre novas atividades e perdas."
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
             <div className="max-w-7xl mx-auto mt-6 space-y-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-4 text-muted-foreground">Carregando dados do dashboard...</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <MonthlyHoursChart 
                        totalHours={TOTAL_MONTHLY_HOURS} 
                        usedHours={totalUsedHours} 
                      />
                      <OeeChart data={oeeData} />
                      <StopReasonsPieChart data={stopReasonsSummary} totalMinutes={totalLostMinutes} />
                  </div>
                )}
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
                            <OperatorInputForm />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Registro de Perda</CardTitle>
                            <CardDescription>Registre peças perdidas e o tempo de inatividade.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <LossInputForm />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-8">
                    <RecentEntriesTable />
                    <RecentLossesTable />
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
