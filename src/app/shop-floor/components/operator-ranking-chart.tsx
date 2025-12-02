'use client';

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { OperatorProductivity } from '@/lib/types';

type OperatorRankingChartProps = {
  data: OperatorProductivity[];
};

const CustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (value > 0) {
      return (
        <text x={x + width + 10} y={y + height / 2} dy={4} fill="hsl(var(--foreground))" fontSize={12} textAnchor="start">
          {value.toLocaleString('pt-BR')}
        </text>
      );
    }
    return null;
  };

export function OperatorRankingChart({ data }: OperatorRankingChartProps) {
  
  const chartData = data.sort((a,b) => a.totalProduced - b.totalProduced);

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Ranking de Produtividade</CardTitle>
        <CardDescription>Peças produzidas por operador no turno atual.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ right: 30 }}
          >
            <XAxis type="number" hide />
            <YAxis 
                dataKey="name" 
                type="category"
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12 }}
                width={80}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent))' }}
              formatter={(value: number, name, props) => [`${value} peças`, `Produtividade`]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Bar dataKey="totalProduced" name="Peças Produzidas" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="totalProduced" content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
