
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ProductionRecord } from '@/lib/types';
import { cn } from '@/lib/utils';

type TechnologyHoursBarChartProps = {
  records: ProductionRecord[];
  className?: string;
};

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

export function TechnologyHoursBarChart({ records, className }: TechnologyHoursBarChartProps) {
  const chartData = useMemo(() => {
    const totals = {
      'Centro': 0,
      'Torno': 0,
      'Programação': 0,
    };

    records.forEach(record => {
      totals['Centro'] += record.centroTime || 0;
      totals['Torno'] += record.tornoTime || 0;
      totals['Programação'] += record.programacaoTime || 0;
    });

    return [
      { name: 'Centro', 'Horas': totals['Centro'] },
      { name: 'Torno', 'Horas': totals['Torno'] },
      { name: 'Programação', 'Horas': totals['Programação'] },
    ];
  }, [records]);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Horas por Tecnologia</CardTitle>
        <CardDescription>Total de horas de produção por tipo de máquina.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis unit="h" />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)}h`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Legend />
            <Bar dataKey="Horas" fill="hsl(var(--primary))">
              <LabelList dataKey="Horas" content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
