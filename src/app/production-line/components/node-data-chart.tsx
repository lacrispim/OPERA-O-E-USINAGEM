'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";

type NodeDataChartProps = {
  data: any[];
};

const chartConfig = {
  requisicao: {
    label: "Requisição",
    color: "hsl(var(--primary))",
  },
};

export function NodeDataChart({ data }: NodeDataChartProps) {
  const chartData = useMemo(() => {
    return data
      .map(item => ({
        name: `Item ${item.id}`, 
        requisicao: Number(item['Requisição']) || 0,
      }))
      .filter(item => item.requisicao > 0);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfico de Requisições - Página 1</CardTitle>
        <CardDescription>Visualização dos valores de "Requisição" para cada item.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <BarChart data={chartData} accessibilityLayer margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              dataKey="requisicao"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="requisicao"
              fill="var(--color-requisicao)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
