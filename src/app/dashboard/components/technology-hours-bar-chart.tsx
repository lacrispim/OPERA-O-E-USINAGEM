
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ProductionRecord } from '@/lib/types';
import { cn } from '@/lib/utils';

type TechnologyHoursBarChartProps = {
  records: ProductionRecord[];
  className?: string;
};

const CustomLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (value > 0) {
    return (
      <text x={x + width + 5} y={y + height / 2} dy={4} fill="hsl(var(--foreground))" fontSize={12} textAnchor="start">
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
    ].sort((a,b) => a.Horas - b.Horas); // Sort to have a nice visual flow
  }, [records]);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Horas por Tecnologia</CardTitle>
        <CardDescription>Total de horas de produção por tipo de máquina.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 20, right: 50, left: 20, bottom: 5 }}
          >
            <XAxis type="number" unit="h" axisLine={true} tickLine={false} />
            <YAxis 
                dataKey="name" 
                type="category"
                axisLine={true} 
                tickLine={false} 
                width={100}
            />
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
            <Bar dataKey="Horas" fill="hsl(var(--primary))" name="Total de Horas" radius={[0, 4, 4, 0]}>
              <LabelList dataKey="Horas" content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
