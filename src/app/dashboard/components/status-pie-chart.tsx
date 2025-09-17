
'use client';

import { useMemo } from 'react';
import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ProductionRecord } from '@/lib/types';
import { cn } from '@/lib/utils';

type StatusPieChartProps = {
  records: ProductionRecord[];
  className?: string;
};

const STATUS_COLORS: Record<string, string> = {
  'Fila de Produção': 'hsl(var(--chart-status-fila))',
  'Em Produção': 'hsl(var(--chart-status-producao))',
  'TBD': 'hsl(var(--chart-status-tbd))',
  'Encerrado': 'hsl(var(--chart-status-encerrada))',
  'Declinado': 'hsl(var(--chart-status-declinado))',
  'Tratamento': 'hsl(var(--chart-status-tratamento))',
  'Outro': 'hsl(var(--chart-status-outro))',
};

const getStatusColor = (status: string) => STATUS_COLORS[status] || STATUS_COLORS['Outro'];

export function StatusPieChart({ records, className }: StatusPieChartProps) {
  const chartData = useMemo(() => {
    const statusCounts = records.reduce((acc, record) => {
      const status = record.status || 'Outro';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
  }, [records]);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Distribuição por Status</CardTitle>
        <CardDescription>Contagem de requisições por cada status.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
              }}
              formatter={(value: number, name: string) => [`${value} requisições`, name]}
            />
            <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={10} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={50}
              paddingAngle={2}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                 const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                 const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                 const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

                 return (
                   <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12">
                     {`${(percent * 100).toFixed(0)}%`}
                   </text>
                 );
               }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
