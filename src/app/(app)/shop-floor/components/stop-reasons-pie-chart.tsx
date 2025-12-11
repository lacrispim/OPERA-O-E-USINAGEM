'use client';

import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type StopReasonsPieChartProps = {
  data: { name: string; value: number }[];
  totalMinutes: number;
};

const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

export function StopReasonsPieChart({ data, totalMinutes }: StopReasonsPieChartProps) {
  const totalHours = (totalMinutes / 60).toFixed(1);
  const hasData = data.length > 0 && data[0].name !== "Nenhuma perda registrada";

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Principais Motivos de Parada</CardTitle>
        <CardDescription>Análise das últimas 24 horas.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center">
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
              data={hasData ? data : [{ name: 'N/A', value: 1 }]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={60}
              paddingAngle={hasData ? 2 : 0}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                 if (!hasData) return null;
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
                <Cell 
                  key={`cell-${index}`} 
                  fill={hasData ? COLORS[index % COLORS.length] : 'hsl(var(--chart-neutral))'} 
                  stroke={hasData ? COLORS[index % COLORS.length] : 'hsl(var(--chart-neutral))'}
                />
              ))}
            </Pie>
            {hasData && (
              <Legend 
                iconSize={10} 
                wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}
              />
            )}
             <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-center"
              >
                <tspan x="50%" dy="-0.5em" className="text-2xl font-bold">
                  {totalHours}h
                </tspan>
                <tspan x="50%" dy="1.2em" className="text-xs text-muted-foreground">
                  Total Perdido
                </tspan>
              </text>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
