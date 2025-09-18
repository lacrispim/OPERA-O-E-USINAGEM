'use client';

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ProductionRecord } from '@/lib/types';
import { cn } from '@/lib/utils';

type StatusHoursBarChartProps = {
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

export function StatusHoursBarChart({ records, className }: StatusHoursBarChartProps) {
  const chartData = useMemo(() => {
    const dataByStatus: { [key: string]: number } = {};

    records.forEach(record => {
      const status = record.status || 'Outro';
      if (!dataByStatus[status]) {
        dataByStatus[status] = 0;
      }
      const totalHours = (record.centroTime || 0) + (record.tornoTime || 0) + (record.programacaoTime || 0);
      dataByStatus[status] += totalHours;
    });

    return Object.keys(dataByStatus).map(status => ({
      name: status,
      'Horas': dataByStatus[status],
    })).sort((a, b) => b.Horas - a.Horas);
  }, [records]);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Horas por Status</CardTitle>
        <CardDescription>Total de horas de produção por status.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tickLine={false} axisLine={true} />
            <YAxis unit="h" tickLine={false} axisLine={true} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent))', radius: 'var(--radius)' }}
              formatter={(value: number) => [`${value.toFixed(2)}h`, 'Total']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Legend />
            <Bar dataKey="Horas" fill="hsl(var(--primary))" name="Total de Horas" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="Horas" content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
