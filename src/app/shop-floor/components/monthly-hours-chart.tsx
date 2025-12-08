'use client';

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type MonthlyHoursChartProps = {
  totalHours: number;
  usedHours: number;
};

const CustomLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (value === 0) return null;
  return (
    <text x={x + width / 2} y={y} dy={-4} fill="hsl(var(--foreground))" fontSize={12} textAnchor="middle">
      {`${value.toFixed(1)}h`}
    </text>
  );
};

export function MonthlyHoursChart({ totalHours, usedHours }: MonthlyHoursChartProps) {
  const chartData = [
    {
      name: 'Horas Totais',
      value: totalHours,
      fill: 'hsl(var(--chart-neutral))',
    },
    {
      name: 'Horas Utilizadas',
      value: usedHours,
      fill: 'hsl(var(--primary))',
    },
  ];

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Resumo de Horas Mensais</CardTitle>
        <CardDescription>Total de horas de usinagem utilizadas vs. disponíveis no mês.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis unit="h" hide />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent))' }}
              formatter={(value: number) => [`${value.toFixed(1)}h`, 'Total']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="value" content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
