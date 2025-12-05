'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { OperatorProductionInput } from '@/lib/types';

type MachineHoursSummaryProps = {
  entries: OperatorProductionInput[];
};

const MONTHLY_HOURS_PER_MACHINE = 270; // 540h / 2 machines

export function MachineHoursSummary({ entries }: MachineHoursSummaryProps) {
  const machineHours = useMemo(() => {
    const hoursByMachine: Record<string, number> = {};

    entries.forEach(entry => {
      const hours = (entry.productionTimeSeconds || 0) / 3600;
      if (hoursByMachine[entry.machineId]) {
        hoursByMachine[entry.machineId] += hours;
      } else {
        hoursByMachine[entry.machineId] = hours;
      }
    });

    return Object.entries(hoursByMachine)
      .map(([machineId, totalHours]) => ({
        machineId,
        totalHours,
        percentage: (totalHours / MONTHLY_HOURS_PER_MACHINE) * 100,
      }))
      .sort((a, b) => b.totalHours - a.totalHours);
  }, [entries]);

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Horas Consumidas por Máquina</CardTitle>
        <CardDescription>Total de horas de usinagem registradas por equipamento.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {machineHours.length > 0 ? (
            machineHours.map(({ machineId, totalHours, percentage }) => (
              <div key={machineId} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-medium">{machineId}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{totalHours.toFixed(1)}h</span> / {MONTHLY_HOURS_PER_MACHINE}h
                  </p>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center pt-8">
              Nenhum tempo de produção registrado ainda.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
