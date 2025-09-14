'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ProductionRecord } from "@/lib/types";
import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";

type TotalHoursByTypeChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  hours: {
    label: "Horas",
  },
  centro: {
    label: "Centro",
    color: "hsl(var(--chart-1))",
  },
  torno: {
    label: "Torno",
    color: "hsl(var(--chart-3))",
  },
  programacao: {
    label: "Programação",
    color: "hsl(var(--chart-4))",
  },
};

export function TotalHoursByTypeChart({ records }: TotalHoursByTypeChartProps) {
  const chartData = useMemo(() => {
    const totals = records.reduce(
      (acc, record) => {
        acc.centro += record.centroTime || 0;
        acc.torno += record.tornoTime || 0;
        acc.programacao += record.programacaoTime || 0;
        return acc;
      },
      { centro: 0, torno: 0, programacao: 0 }
    );

    return [
      { type: "Centro", hours: totals.centro, fill: "var(--color-centro)" },
      { type: "Torno", hours: totals.torno, fill: "var(--color-torno)" },
      { type: "Programação", hours: totals.programacao, fill: "var(--color-programacao)" },
    ];
  }, [records]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total de Horas por Tipo de Processo</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart 
            data={chartData} 
            accessibilityLayer 
            layout="vertical"
            margin={{ left: 10 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="type"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              width={80}
            />
            <XAxis
              dataKey="hours"
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              allowDecimals={false}
              valueFormatter={(value) => `${value}h`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" formatter={(value) => `${Number(value).toFixed(1)}h`} />}
            />
            <Bar
              dataKey="hours"
              radius={4}
              barSize={40}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
