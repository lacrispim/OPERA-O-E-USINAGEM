'use client';

import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type StopReasonsPieChartProps = {
  data: { name: string; value: number }[];
};

const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

export function StopReasonsPieChart({ data }: StopReasonsPieChartProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Principais Motivos de Parada</CardTitle>
        <CardDescription>Análise das últimas 24 horas.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
              }}
              formatter={(value: number, name: string) => [`${value} minutos`, name]}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={60}
              paddingAngle={2}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                 const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                 const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                 const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

                 return (
                   <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12">
                     {`${(percent * 100).toFixed(0)}%`}
                   </text>
                 );
               }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend 
              iconSize={10} 
              wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
