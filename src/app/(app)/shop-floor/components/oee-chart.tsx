'use client';

import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { MachineOEE } from '@/lib/types';

type OeeChartProps = {
  data: MachineOEE[];
};

const CustomLabel = (props: any) => {
  const { x, y, width, value } = props;
  return (
    <text x={x + width / 2} y={y} dy={-4} fill="hsl(var(--foreground))" fontSize={12} textAnchor="middle">
      {`${value.toFixed(0)}%`}
    </text>
  );
};

export function OeeChart({ data }: OeeChartProps) {
  const chartData = data.map(item => ({
    name: item.machineId,
    OEE: item.oee,
  })).sort((a, b) => b.OEE - a.OEE);

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>OEE por Máquina</CardTitle>
        <CardDescription>Eficiência geral dos equipamentos em tempo real.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20 }}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis unit="%" hide />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent))' }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'OEE']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Bar dataKey="OEE" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="OEE" content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
