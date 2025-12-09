
'use client';

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Monitor, Tablet, TrendingUp } from "lucide-react";
import { OperatorInputForm } from "./components/operator-input-form";
import { LossInputForm } from "./components/loss-input-form";
import { RecentEntriesTable } from "./components/recent-entries-table";
import { RecentLossesTable } from "./components/recent-losses-table";
import { OeeChart } from "./components/oee-chart";
import { StopReasonsPieChart } from "./components/stop-reasons-pie-chart";
import type { OperatorProductionInput, ProductionLossInput } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { useDatabase } from "@/firebase";
import { ref, onValue, query, orderByChild } from "firebase/database";
import { startOfDay, endOfDay } from 'date-fns';
import { ProductionOptimizationView } from "./components/production-optimization-view";
import { TotalHoursCard } from "./components/total-hours-card";

const TOTAL_MONTHLY_HOURS = 540;
const TOTAL_SHIFT_SECONDS = 8 * 60 * 60; // 8 hours shift in seconds
const IDEAL_CYCLE_TIME_SECONDS = 25; // Ideal time to produce one part

export default function ShopFloorPage() {
    const database = useDatabase();
    const [recentEntries, setRecentEntries] = useState<OperatorProductionInput[]>([]);
    const [recentLosses, setRecentLosses] = useState<ProductionLossInput[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!database) return;

        setIsLoading(true);
        setError(null);
        let activeListeners = 2;

        const handleLoad = () => {
            activeListeners--;
            if (activeListeners === 0) {
                setIsLoading(false);
            }
        };
        
        const handleError = (err: any, type: string) => {
            console.error(`Error fetching ${type}:`, err);
            setError(`Failed to load ${type}. Check your Realtime Database rules and internet connection.`);
            setIsLoading(false);
        };

        const entriesRef = ref(database, "production-entries");
        const entriesQuery = query(entriesRef, orderByChild("timestamp"));
        const entriesUnsubscribe = onValue(entriesQuery, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const entriesArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                })).sort((a, b) => b.timestamp - a.timestamp);
                setRecentEntries(entriesArray);
            } else {
                setRecentEntries([]);
            }
            handleLoad();
        }, (err) => handleError(err, 'production entries'));

        const lossesRef = ref(database, "production-losses");
        const lossesQuery = query(lossesRef, orderByChild("timestamp"));
        const lossesUnsubscribe = onValue(lossesQuery, (snapshot) => {
            const data = snapshot.val();
            
            if (data) {
                const lossesArray: ProductionLossInput[] = Object.keys(data)
                    .map(key => ({
                        id: key,
                        ...data[key]
                    }))
                    .sort((a, b) => b.timestamp - a.timestamp);
                setRecentLosses(lossesArray);
            } else {
                setRecentLosses([]);
            }
            handleLoad();
        }, (err) => handleError(err, 'production losses'));

        return () => {
            entriesUnsubscribe();
            lossesUnsubscribe();
        };
    }, [database]);


  const { stopReasonsSummary, totalLostMinutes } = useMemo(() => {
    const now = new Date();
    const startOfToday = startOfDay(now).getTime();
    const lossesToday = recentLosses.filter(loss => loss.timestamp >= startOfToday);

    if (!lossesToday || lossesToday.length === 0) {
      return { stopReasonsSummary: [{ name: "Nenhuma perda registrada", value: 1 }], totalLostMinutes: 0 };
    }
    const summary: Record<string, number> = {};
    let totalMinutes = 0;
    lossesToday.forEach(loss => {
      const reason = loss.reason || 'Desconhecido';
      const minutes = loss.timeLostMinutes || 0;
      if (summary[reason]) {
        summary[reason] += minutes;
      } else {
        summary[reason] = minutes;
      }
      totalMinutes += minutes;
    });
    
    const summaryArray = Object.entries(summary).map(([name, value]) => ({ name, value }));
    return { stopReasonsSummary: summaryArray, totalLostMinutes: totalMinutes };
  }, [recentLosses]);

  const { oeeData, totalUsedHours } = useMemo(() => {
    const machineData: Record<string, { totalProduced: number, totalLost: number, runTime: number, downTime: number }> = {};
    
    const now = new Date();
    const startOfToday = startOfDay(now).getTime();
    const endOfToday = endOfDay(now).getTime();

    const entriesToday = recentEntries.filter(e => {
        const ts = e.timestamp;
        if (!ts) return false;
        return ts >= startOfToday && ts <= endOfToday;
    });
    
    const lossesToday = recentLosses.filter(l => {
        const ts = l.timestamp;
        if (!ts) return false;
        return ts >= startOfToday && ts <= endOfToday;
    });

    const machines = new Set([...entriesToday.map(e => e.machineId), ...lossesToday.map(l => l.machineId)]);

    machines.forEach(machineId => {
      if (!machineId) return;
      machineData[machineId] = {
        totalProduced: 0,
        totalLost: 0,
        runTime: 0,
        downTime: 0,
      };
    });

    let usedSeconds = 0;
    recentEntries.forEach(entry => { // All entries for monthly hours
        usedSeconds += entry.productionTimeSeconds;
    });

    entriesToday.forEach(entry => {
      if (machineData[entry.machineId]) {
        machineData[entry.machineId].totalProduced += entry.quantityProduced;
        machineData[entry.machineId].runTime += entry.productionTimeSeconds;
      }
    });

    lossesToday.forEach(loss => {
      if (machineData[loss.machineId]) {
        machineData[loss.machineId].totalLost += loss.quantityLost;
        machineData[loss.machineId].downTime += loss.timeLostMinutes * 60;
      }
    });

    const oeeByMachine = Object.entries(machineData).map(([machineId, data]) => {
      const { totalProduced, totalLost, runTime, downTime } = data;
      
      const plannedProductionTime = TOTAL_SHIFT_SECONDS;
      const operatingTime = plannedProductionTime - downTime;
      
      const availability = operatingTime > 0 ? (operatingTime / plannedProductionTime) * 100 : 0;
      
      const performance = runTime > 0
        ? ((totalProduced * IDEAL_CYCLE_TIME_SECONDS) / runTime) * 100
        : 0;

      const totalParts = totalProduced + totalLost;
      const quality = totalParts > 0 ? (totalProduced / totalParts) * 100 : 0;
      
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
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="supervisor">
              <Monitor className="mr-2" />
              Visão Supervisor
            </TabsTrigger>
            <TabsTrigger value="operator">
              <Tablet className="mr-2" />
              Modo Operador
            </TabsTrigger>
            <TabsTrigger value="optimization">
              <TrendingUp className="mr-2" />
              Otimização
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="supervisor">
             <div className="max-w-7xl mx-auto mt-6 space-y-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-4 text-muted-foreground">Carregando dados do dashboard...</p>
                  </div>
                ) : error ? (
                   <div className="flex justify-center items-center h-64 bg-destructive/10 rounded-lg">
                      <p className="text-destructive">{error}</p>
                   </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <TotalHoursCard 
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

           <TabsContent value="optimization">
                <div className="max-w-7xl mx-auto mt-6 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                             <p className="ml-4 text-muted-foreground">Carregando dados de otimização...</p>
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center h-64 bg-destructive/10 rounded-lg">
                            <p className="text-destructive">{error}</p>
                        </div>
                    ) : (
                        <ProductionOptimizationView productionData={recentEntries} lossData={recentLosses} />
                    )}
                </div>
           </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
