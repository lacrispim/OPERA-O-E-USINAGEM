
'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { OperatorProductionInput } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { parseISO } from 'date-fns';

type MachineHoursSummaryProps = {
  data: OperatorProductionInput[];
};

const safeParseDate = (timestamp: Timestamp | string | Date): Date | null => {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === 'string') {
        try {
            return parseISO(timestamp);
        } catch (e) {
            return null;
        }
    }
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
    }
    return null;
};

const machineColors: { [key: string]: string } = {
  'Torno CNC - Centur 30': 'hsl(var(--chart-1))',
  'Centro de Usinagem D600': 'hsl(var(--chart-2))',
  // Add more machines and colors as needed
};


export function MachineHoursSummary({ data }: MachineHoursSummaryProps) {
  const { chartData, machineKeys } = useMemo(() => {
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    const weeklyData: { [day: string]: { [machine: string]: number } } = daysOfWeek.reduce((acc, day) => {
      acc[day] = {};
      return acc;
    }, {} as { [day: string]: { [machine: string]: number } });

    const machines = new Set<string>();

    data.forEach(entry => {
      const entryDate = safeParseDate(entry.timestamp);
      if (entryDate) {
        const dayName = daysOfWeek[entryDate.getDay()];
        const machine = entry.machineId;
        const hours = entry.productionTimeSeconds / 3600;

        machines.add(machine);

        if (!weeklyData[dayName][machine]) {
          weeklyData[dayName][machine] = 0;
        }
        weeklyData[dayName][machine] += hours;
      }
    });

    const finalChartData = daysOfWeek.map(day => {
      const dayData: { name: string; [key: string]: any } = { name: day };
      machines.forEach(machine => {
        dayData[machine] = weeklyData[day][machine] || 0;
      });
      return dayData;
    });

    return {
      chartData: finalChartData,
      machineKeys: Array.from(machines)
    };

  }, [data]);

  if (data.length === 0) {
    return (
        <div className="flex items-center justify-center h-[400px] w-full text-muted-foreground">
            Nenhum dado de produção para a semana selecionada.
        </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis unit="h" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
          <Tooltip
            cursor={{ fill: 'hsl(var(--accent))' }}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
            formatter={(value: number) => [`${value.toFixed(2)} horas`, 'Usinagem']}
          />
          <Legend wrapperStyle={{fontSize: "12px"}}/>
          {machineKeys.map((machineKey, index) => (
             <Bar 
                key={machineKey} 
                dataKey={machineKey} 
                stackId="a" 
                fill={machineColors[machineKey] || `hsl(var(--chart-${(index % 5) + 1}))`} 
                radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
