
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ProductionRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Minus } from 'lucide-react';

type FactoryHoursBarChartProps = {
  records: ProductionRecord[];
  className?: string;
};

const ALL_FACTORIES = [
  "Igarassu", "Vinhedo", "Suape", "Aguaí", "Garanhuns", "Indaiatuba", "Valinhos", "Pouso Alegre"
];

const renderCustomLegend = (props: any) => {
  const { payload } = props;

  return (
    <ul className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" className="mt-[-2px]">
            <rect x="0" y="0" width="14" height="14" fill={entry.color} rx="4" />
          </svg>
          <span>{entry.value}</span>
        </li>
      ))}
      <li key="limit-item" className="flex items-center gap-2">
         <div className="w-4 h-4 flex items-center justify-center">
            <svg width="14" height="4" viewBox="0 0 14 2">
                <line x1="0" y1="1" x2="14" y2="1" stroke="hsl(var(--foreground))" strokeWidth="2" strokeDasharray="3 3"/>
            </svg>
         </div>
         <span>Horas Disponíveis</span>
      </li>
    </ul>
  );
};


export function FactoryHoursBarChart({ records, className }: FactoryHoursBarChartProps) {
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
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Horas Planejadas</CardTitle>
        <CardDescription>
          Soma das horas de produção por fábrica. A linha tracejada indica o limite de 60 horas disponíveis.
        </CardDescription>
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
            <Legend content={renderCustomLegend} />
            <ReferenceLine y={60} stroke="hsl(var(--foreground))" strokeDasharray="3 3" strokeWidth={2}>
              <Label value="Limite (60h)" position="insideTopLeft" fill="hsl(var(--foreground))" fontSize={12} fontWeight="bold" />
            </ReferenceLine>
            <Bar dataKey="Horas" fill="hsl(var(--primary))" name="Total de Horas" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
