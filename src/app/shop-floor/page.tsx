
'use client';

import { useState, useMemo } from 'react';
import { collection, addDoc, serverTimestamp, updateDoc, doc, deleteDoc, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { firestore } from '@/lib/firebase';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OeeChart } from "./components/oee-chart";
import { StopReasonsPieChart } from "./components/stop-reasons-pie-chart";
import { OperatorInputForm } from "./components/operator-input-form";
import { RecentEntriesTable } from "./components/recent-entries-table";
import { Monitor, Tablet } from "lucide-react";
import type { OperatorProductionInput, ProductionLossInput, ProductionStatus, MachineOEE } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { LossInputForm } from './components/loss-input-form';
import { RecentLossesTable } from './components/recent-losses-table';
import { MonthlyHoursChart } from './components/monthly-hours-chart';

// OEE Calculation Constants
const TOTAL_AVAILABLE_TIME_SECONDS = 8 * 60 * 60; // 8 hours shift
const IDEAL_CYCLE_TIME_SECONDS = 25; // Ideal time to produce one part
const TOTAL_MONTHLY_HOURS = 540;


export default function ShopFloorPage() {
  const { toast } = useToast();

  const { data: recentEntries, loading: loadingEntries } = useCollection<OperatorProductionInput>(
    'production-entries',
    { constraints: [orderBy('timestamp', 'desc'), limit(500)] }
  );

  const { data: recentLosses, loading: loadingLosses } = useCollection<ProductionLossInput>(
      'production-losses',
      { constraints: [orderBy('timestamp', 'desc'), limit(200)] }
  );

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
        machineData[entry.machineId].productionTime += entry.productionTimeSeconds;
      }
    });

    losses.forEach(loss => {
      if (machineData[loss.machineId]) {
        machineData[loss.machineId].totalLost += loss.quantityLost;
        machineData[loss.machineId].downTime += loss.timeLostMinutes * 60;
      }
    });

    const oeeByMachine: MachineOEE[] = Object.entries(machineData).map(([machineId, data]) => {
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

  const handleRegisterProduction = async (newEntry: Omit<OperatorProductionInput, 'timestamp' | 'status' | 'id'>) => {
    try {
      await addDoc(collection(firestore, 'production-entries'), {
        ...newEntry,
        timestamp: serverTimestamp(),
        status: 'Em produção',
      });
      toast({
        title: "Produção Registrada!",
        description: `${newEntry.quantityProduced} peças registradas para ${newEntry.operatorId}.`,
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: 'destructive',
        title: "Erro ao registrar",
        description: "Não foi possível salvar os dados de produção.",
      });
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ProductionStatus) => {
    const entryRef = doc(firestore, 'production-entries', id);
    try {
      await updateDoc(entryRef, { status: newStatus });
    } catch (error) {
       console.error("Error updating document: ", error);
       toast({
        variant: 'destructive',
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status.",
      });
    }
  };

  const handleDeleteProduction = async (id: string) => {
    const entryRef = doc(firestore, 'production-entries', id);
    try {
      await deleteDoc(entryRef);
      toast({
        variant: 'destructive',
        title: "Registro Removido!",
        description: "O registro de produção foi removido.",
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({
        variant: 'destructive',
        title: "Erro ao remover",
        description: "Não foi possível remover o registro.",
      });
    }
  };

  const handleRegisterLoss = async (newLoss: Omit<ProductionLossInput, 'timestamp' | 'id'>) => {
    try {
      await addDoc(collection(firestore, 'production-losses'), {
        ...newLoss,
        timestamp: serverTimestamp(),
      });
      toast({
          variant: 'destructive',
          title: "Perda Registrada!",
          description: `${newLoss.quantityLost} peças perdidas foram registradas.`,
      });
    } catch (error) {
       console.error("Error adding document: ", error);
      toast({
        variant: 'destructive',
        title: "Erro ao registrar perda",
        description: "Não foi possível salvar os dados de perda.",
      });
    }
  }

  const handleDeleteLoss = async (id: string) => {
    const lossRef = doc(firestore, 'production-losses', id);
    try {
      await deleteDoc(lossRef);
      toast({
          variant: 'destructive',
          title: "Registro de Perda Removido!",
          description: "O registro de perda foi removido.",
      });
    } catch(error) {
      console.error("Error deleting document: ", error);
      toast({
        variant: 'destructive',
        title: "Erro ao remover",
        description: "Não foi possível remover o registro de perda.",
      });
    }
  };

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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                     <MonthlyHoursChart 
                      totalHours={TOTAL_MONTHLY_HOURS} 
                      usedHours={totalUsedHours} 
                    />
                    <OeeChart data={oeeData} />
                    <StopReasonsPieChart data={stopReasonsSummary} totalMinutes={totalLostMinutes} />
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
                    <RecentEntriesTable entries={recentEntries || []} onUpdateStatus={handleUpdateStatus} onDelete={handleDeleteProduction} />
                    <RecentLossesTable entries={recentLosses || []} onDelete={handleDeleteLoss} />
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
