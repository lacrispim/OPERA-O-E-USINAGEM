
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
import { collection, onSnapshot, query, orderBy, where, Timestamp } from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";
import { startOfDay, endOfDay } from 'date-fns';


const TOTAL_MONTHLY_HOURS = 540;
// Same as in OEE calculation
const TOTAL_SHIFT_SECONDS = 8 * 60 * 60; // 8 hours shift in seconds
const IDEAL_CYCLE_TIME_SECONDS = 25; // Ideal time to produce one part


export default function ShopFloorPage() {
    const firestore = useFirestore();
    const [recentEntries, setRecentEntries] = useState<OperatorProductionInput[]>([]);
    const [recentLosses, setRecentLosses] = useState<ProductionLossInput[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (!firestore) {
        // Firestore might not be available on first render, wait for it.
        return;
      };

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
            const permissionError = new FirestorePermissionError({ path: `Query for ${type}`, operation: 'list' });
            errorEmitter.emit('permission-error', permissionError);
            console.error(`Error fetching ${type}:`, err);
            setError(`Failed to load ${type}. Check your Firestore security rules and internet connection.`);
            setIsLoading(false);
        };

        const entriesQuery = query(collection(firestore, "production-entries"), orderBy("timestamp", "desc"));
        const entriesUnsubscribe = onSnapshot(entriesQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OperatorProductionInput));
            setRecentEntries(data);
            handleLoad();
        }, (err) => handleError(err, 'production entries'));

        const now = new Date();
        const startOfToday = startOfDay(now);
        
        // Query for losses in the last 24 hours
        const lossesQuery = query(
            collection(firestore, "production-losses"),
            where("timestamp", ">=", Timestamp.fromDate(startOfToday)),
            orderBy("timestamp", "desc")
        );
        const lossesUnsubscribe = onSnapshot(lossesQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionLossInput));
            setRecentLosses(data);
            handleLoad();
        }, (err) => handleError(err, 'production losses'));

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
    const startOfToday = startOfDay(now);
    const endOfToday = endOfDay(now);

    const entriesToday = recentEntries.filter(e => {
        const ts = e.timestamp;
        if (!ts) return false;
        const date = ts instanceof Timestamp ? ts.toDate() : new Date(ts);
        return date >= startOfToday && date <= endOfToday;
    });
    
    const lossesToday = recentLosses; // Already filtered by query

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
    entriesToday.forEach(entry => {
      usedSeconds += entry.productionTimeSeconds;
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
                ) : error ? (
                   <div className="flex justify-center items-center h-64 bg-destructive/10 rounded-lg">
                      <p className="text-destructive">{error}</p>
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
