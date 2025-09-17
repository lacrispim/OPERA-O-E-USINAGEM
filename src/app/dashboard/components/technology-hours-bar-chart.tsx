
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ProductionRecord } from '@/lib/types';

type TechnologyHoursBarChartProps = {
  records: ProductionRecord[];
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

export function TechnologyHoursBarChart({ records }: TechnologyHoursBarChartProps) {
  const chartData = useMemo(() => {
    const totals = {
      torno: 0,
      programacao: 0,
      centro: 0,
    };

    records.forEach(record => {
      totals.torno += record.tornoTime || 0;
      totals.programacao += record.programacaoTime || 0;
      totals.centro += record.centroTime || 0;
    });

    return [
      { name: 'Torno', Horas: totals.torno },
      { name: 'Programação', Horas: totals.programacao },
      { name: 'Centro', Horas: totals.centro },
    ];
  }, [records]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horas por Tecnologia</CardTitle>
        <CardDescription>
          Soma total das horas de produção para cada tipo de tecnologia.
        </CardDescription>
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
            <Bar dataKey="Horas" name="Torno" fill="hsl(var(--chart-1))">
              <LabelList dataKey="Horas" content={<CustomLabel />} />
            </Bar>
             <Bar dataKey="Horas" name="Programação" fill="hsl(var(--chart-2))">
              <LabelList dataKey="Horas" content={<CustomLabel />} />
            </Bar>
             <Bar dataKey="Horas" name="Centro" fill="hsl(var(--chart-3))">
              <LabelList dataKey="Horas" content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
