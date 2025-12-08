
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { OperatorProductionInput } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { parseISO } from 'date-fns';

type MachineHoursSummaryProps = {
  entries: OperatorProductionInput[];
};

const COLORS: Record<string, string> = {
  'Torno CNC - Centur 30': 'hsl(var(--chart-1))',
  'Centro de Usinagem D600': 'hsl(var(--chart-2))',
  // Add more machines and colors if needed
};

const getDayOfWeek = (date: Date): string => {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[date.getDay()];
};

export function MachineHoursSummary({ entries }: MachineHoursSummaryProps) {
  const { data: chartData, machines } = useMemo(() => {
    const dayOrder = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dataByDay: Record<string, Record<string, number>> = {};
    dayOrder.forEach(day => { dataByDay[day] = {}; });

    const machineIds = new Set<string>();

    if (entries) {
        entries.forEach(entry => {
          let entryDate: Date;
          // Robust timestamp parsing
          if (entry.timestamp instanceof Timestamp) {
            entryDate = entry.timestamp.toDate();
          } else if (typeof entry.timestamp === 'string') {
            entryDate = parseISO(entry.timestamp);
          } else if (entry.timestamp && typeof (entry.timestamp as any).seconds === 'number') {
            try {
                entryDate = new Date((entry.timestamp as any).seconds * 1000);
            } catch (e) {
                 console.error("Invalid timestamp format for entry:", entry.id, entry.timestamp);
                 return; // Skip if timestamp is invalid
            }
          } else {
             console.error("Unknown timestamp format for entry:", entry.id, entry.timestamp);
             return; // Skip if timestamp is unknown
          }
          
          if (isNaN(entryDate.getTime())) return;

          const dayOfWeek = getDayOfWeek(entryDate);
          const hours = (entry.productionTimeSeconds || 0) / 3600;
          
          if (!dataByDay[dayOfWeek]) {
              dataByDay[dayOfWeek] = {};
          }
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
            dayData[id] = dataByDay[day]?.[id] || 0;
        });
        return dayData;
    });

    const sortedMachines = Array.from(machineIds).sort();

    return {
        data: formattedData,
        machines: sortedMachines
    };

  }, [entries]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Horas de Usinagem por Dia na Semana</CardTitle>
        <CardDescription>Distribuição de horas trabalhadas por equipamento para a semana selecionada.</CardDescription>
      </CardHeader>
      <CardContent>
        {(entries && entries.length > 0 && machines.length > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis unit="h" allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
                <Tooltip
                    formatter={(value: number, name: string) => [`${value.toFixed(1)}h`, name]}
                    contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    }}
                    cursor={{ fill: 'hsl(var(--accent))', radius: 4 }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
                {machines.map((machineId) => (
                    <Bar
                        key={machineId}
                        dataKey={machineId}
                        stackId="a"
                        fill={COLORS[machineId] || 'hsl(var(--chart-neutral))'}
                        name={machineId}
                        radius={[4, 4, 0, 0]}
                    />
                ))}
            </BarChart>
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
