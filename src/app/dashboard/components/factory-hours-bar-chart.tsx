
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ProductionRecord } from '@/lib/types';

type FactoryHoursBarChartProps = {
  records: ProductionRecord[];
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

export function FactoryHoursBarChart({ records }: FactoryHoursBarChartProps) {
  const chartData = useMemo(() => {
    const dataByFactory: { [key: string]: number } = {};

    // Initialize all factories with 0 hours
    ALL_FACTORIES.forEach(factory => {
      dataByFactory[factory] = 0;
    });

    // Sum hours for each factory from the records
    records.forEach(record => {
      if (record.requestingFactory && dataByFactory.hasOwnProperty(record.requestingFactory)) {
        const totalHours = record.centroTime + record.tornoTime + record.programacaoTime;
        dataByFactory[record.requestingFactory] += totalHours || 0;
      }
    });

    return Object.keys(dataByFactory).map(factory => ({
      name: factory,
      'Horas': dataByFactory[factory],
    })).sort((a, b) => b.Horas - a.Horas);
  }, [records]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total de Horas por Site</CardTitle>
        <CardDescription>Soma das horas de produção (torno, centro, programação) por fábrica.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
            <YAxis unit="h" />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)}h`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Legend />
            <Bar dataKey="Horas" fill="hsl(var(--primary))" name="Total de Horas">
              <LabelList dataKey="Horas" content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
