
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ProductionRecord } from '@/lib/types';
import { cn } from '@/lib/utils';

type PlannedPiecesBarChartProps = {
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
        {value.toLocaleString('pt-BR')}
      </text>
    );
  }
  return null;
};


export function PlannedPiecesBarChart({ records, className }: PlannedPiecesBarChartProps) {
  const chartData = useMemo(() => {
    const dataByFactory: { [key: string]: number } = {};

    // Initialize all factories with 0 pieces
    ALL_FACTORIES.forEach(factory => {
        dataByFactory[factory] = 0;
    });

    // Sum quantities for each factory from the records
    records.forEach(record => {
      if (record.requestingFactory && dataByFactory.hasOwnProperty(record.requestingFactory)) {
        dataByFactory[record.requestingFactory] += record.quantity || 0;
      }
    });

    return Object.keys(dataByFactory).map(factory => ({
      name: factory,
      'Quantidade': dataByFactory[factory],
    })).sort((a, b) => b.Quantidade - a.Quantidade);
  }, [records]);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Quantidade de Peças Planejadas</CardTitle>
        <CardDescription>Total de peças planejadas por fábrica.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tickLine={false} axisLine={true} />
            <YAxis tickLine={false} axisLine={true} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent))', radius: 'var(--radius)' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Legend />
            <Bar dataKey="Quantidade" fill="hsl(var(--chart-status-fila))" name="Quantidade de Peças" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="Quantidade" content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
