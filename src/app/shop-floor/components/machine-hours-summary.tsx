
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Line, LineChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { OperatorProductionInput } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { parseISO } from 'date-fns';

type MachineHoursSummaryProps = {
  entries: OperatorProductionInput[];
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const getDayOfWeek = (date: Date): string => {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[date.getDay()];
};

export function MachineHoursSummary({ entries }: MachineHoursSummaryProps) {
  const chartData = useMemo(() => {
    const dayOrder = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dataByDay: Record<string, Record<string, number>> = {};
    dayOrder.forEach(day => { dataByDay[day] = {}; });

    const machineIds = new Set<string>();

    if (entries) {
        entries.forEach(entry => {
          let entryDate: Date;
          if (entry.timestamp instanceof Timestamp) {
            entryDate = entry.timestamp.toDate();
          } else if (typeof entry.timestamp === 'string') {
            entryDate = parseISO(entry.timestamp);
          } else {
            return; // Skip if timestamp is invalid
          }
          
          const dayOfWeek = getDayOfWeek(entryDate);
          const hours = (entry.productionTimeSeconds || 0) / 3600;
          
          if (!dataByDay[dayOfWeek][entry.machineId]) {
            dataByDay[dayOfWeek][entry.machineId] = 0;
          }
          dataByDay[dayOfWeek][entry.machineId] += hours;
          machineIds.add(entry.machineId);
        });
    }
    
    const formattedData = dayOrder.map(day => {
        const dayData: { day: string, [key: string]: any } = { day };
        machineIds.forEach(id => {
            dayData[id] = dataByDay[day][id] || 0;
        });
        return dayData;
    });

    return {
        data: formattedData,
        machines: Array.from(machineIds)
    };

  }, [entries]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Horas Consumidas por Máquina na Semana</CardTitle>
        <CardDescription>Total de horas de usinagem por equipamento para a semana selecionada.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.machines.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis unit="h" domain={[0, 24]} allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string) => [`${value.toFixed(1)}h`, name]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {chartData.machines.map((machineId, index) => (
                <Line
                  key={machineId}
                  type="monotone"
                  dataKey={machineId}
                  name={machineId}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-sm text-muted-foreground">
              Nenhum tempo de produção registrado na semana selecionada.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    