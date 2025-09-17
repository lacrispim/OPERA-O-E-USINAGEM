
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ProductionRecord } from '@/lib/types';

type PlannedPiecesBarChartProps = {
  records: ProductionRecord[];
};

const ALL_FACTORIES = [
  "Igarassu", "Vinhedo", "Suape", "Aguaí", "Garanhuns", "Indaiatuba", "Valinhos", "Pouso Alegre"
];

export function PlannedPiecesBarChart({ records }: PlannedPiecesBarChartProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>Quantidade de Peças Planejadas</CardTitle>
        <CardDescription>Total de peças planejadas por fábrica.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Legend />
            <Bar dataKey="Quantidade" fill="hsl(var(--primary))" name="Quantidade de Peças" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
