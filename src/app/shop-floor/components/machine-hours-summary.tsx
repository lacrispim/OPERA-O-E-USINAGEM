
'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
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
};


export function MachineHoursSummary({ data }: MachineHoursSummaryProps) {
  const chartData = useMemo(() => {
    const machineHours: { [machine: string]: number } = {};

    data.forEach(entry => {
      const machine = entry.machineId;
      const hours = entry.productionTimeSeconds / 3600;

      if (!machineHours[machine]) {
        machineHours[machine] = 0;
      }
      machineHours[machine] += hours;
    });

    return Object.entries(machineHours).map(([name, hours]) => ({
      name,
      hours
    }));

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
            top: 30,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" unit="h" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            width={120}
            tick={{ textAnchor: 'start' }}
            />
          <Tooltip
            cursor={{ fill: 'hsl(var(--accent))' }}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
            formatter={(value: number) => [`${value.toFixed(2)} horas`, 'Total da Semana']}
          />
          <Bar 
            dataKey="hours" 
            fill="hsl(var(--primary))" 
            radius={[0, 4, 4, 0]}
            barSize={35}
          >
             <LabelList 
                dataKey="hours" 
                position="right" 
                offset={8}
                className="fill-foreground font-bold"
                formatter={(value: number) => `${value.toFixed(1)}h`}
             />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
