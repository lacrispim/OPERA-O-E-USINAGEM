
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ProductionRecord } from '@/lib/types';
import { cn } from '@/lib/utils';

type ProgramacaoHoursBarChartProps = {
  records: ProductionRecord[];
  className?: string;
};

const ALL_FACTORIES = [
  "Igarassu", "Vinhedo", "Suape", "Aguaí", "Garanhuns", "Indaiatuba", "Valinhos", "Pouso Alegre"
];

const CustomLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (value > 0) {
    return (
      <text x={x + width / 2} y={y} dy={-4} fill="hsl(var(--foreground))" fontSize={12} textAnchor="middle">
        {value.toFixed(1)}h
      </text>
    );
  }
  return null;
};

export function ProgramacaoHoursBarChart({ records, className }: ProgramacaoHoursBarChartProps) {
  const chartData = useMemo(() => {
    const dataByFactory: { [key: string]: number } = {};

    ALL_FACTORIES.forEach(factory => {
      dataByFactory[factory] = 0;
    });

    records.forEach(record => {
      if (record.requestingFactory && dataByFactory.hasOwnProperty(record.requestingFactory)) {
        dataByFactory[record.requestingFactory] += record.programacaoTime || 0;
      }
    });

    return Object.keys(dataByFactory).map(factory => ({
      name: factory,
      'Horas': dataByFactory[factory],
    })).sort((a, b) => b.Horas - a.Horas);
  }, [records]);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Horas de Programação</CardTitle>
        <CardDescription>Total de horas por fábrica.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tickLine={false} axisLine={true} />
            <YAxis unit="h" tickLine={false} axisLine={true} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent))', radius: 'var(--radius)' }}
              formatter={(value: number) => `${value.toFixed(2)}h`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Legend />
            <Bar dataKey="Horas" fill="hsl(var(--chart-4))" name="Horas de Programação" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="Horas" content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
