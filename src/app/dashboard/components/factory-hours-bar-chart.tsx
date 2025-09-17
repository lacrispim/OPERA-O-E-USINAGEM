
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ProductionRecord } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ALL_FACTORIES = [
  "Igarassu", "Vinhedo", "Suape", "Aguaí", "Garanhuns", "Indaiatuba", "Valinhos", "Pouso Alegre"
];

type FactoryHoursBarChartProps = {
  records: ProductionRecord[];
};

export function FactoryHoursBarChart({ records }: FactoryHoursBarChartProps) {
  const chartData = useMemo(() => {
    const factoryHours: { [key: string]: number } = {};

    // Initialize all factories with 0 hours
    ALL_FACTORIES.forEach(factory => {
      factoryHours[factory] = 0;
    });

    records.forEach(record => {
      const factory = record.requestingFactory;
      if (!factoryHours[factory]) {
        factoryHours[factory] = 0;
      }
      // manufacturingTime is already in hours
      factoryHours[factory] += record.manufacturingTime;
    });

    return Object.keys(factoryHours)
      .map(factory => ({
        name: factory,
        "Total de Horas": parseFloat(factoryHours[factory].toFixed(2)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [records]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total de Horas por Site</CardTitle>
        <CardDescription>
          Soma das horas de Torno, Programação e Centro para cada fábrica.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))' }}
                contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Bar dataKey="Total de Horas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
