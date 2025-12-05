'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { OperatorProductionInput } from '@/lib/types';

type OperatorHoursSummaryProps = {
  entries: OperatorProductionInput[];
};

const MONTHLY_HOURS_PER_OPERATOR = 135;

export function OperatorHoursSummary({ entries }: OperatorHoursSummaryProps) {
  const operatorHours = useMemo(() => {
    const hoursByOperator: Record<string, number> = {};

    entries.forEach(entry => {
      const hours = (entry.productionTimeSeconds || 0) / 3600;
      if (hoursByOperator[entry.operatorId]) {
        hoursByOperator[entry.operatorId] += hours;
      } else {
        hoursByOperator[entry.operatorId] = hours;
      }
    });

    return Object.entries(hoursByOperator)
      .map(([operatorId, totalHours]) => ({
        operatorId,
        totalHours,
        percentage: (totalHours / MONTHLY_HOURS_PER_OPERATOR) * 100,
      }))
      .sort((a, b) => b.totalHours - a.totalHours);
  }, [entries]);

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Horas Consumidas por Operador</CardTitle>
        <CardDescription>Total de horas de usinagem registradas por operador.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {operatorHours.length > 0 ? (
            operatorHours.map(({ operatorId, totalHours, percentage }) => (
              <div key={operatorId} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-medium">{operatorId}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{totalHours.toFixed(1)}h</span> / {MONTHLY_HOURS_PER_OPERATOR}h
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
