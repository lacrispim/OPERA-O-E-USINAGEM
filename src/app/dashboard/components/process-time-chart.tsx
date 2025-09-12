'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ProductionRecord } from "@/lib/types";
import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";

type ProcessTimeChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  hours: {
    label: "Horas",
  },
  centro: {
    label: "Centro (h)",
    color: "hsl(var(--chart-1))",
  },
  torno: {
    label: "Torno (h)",
    color: "hsl(var(--chart-2))",
  },
  programacao: {
    label: "Programação (h)",
    color: "hsl(var(--chart-3))",
  },
};

export function ProcessTimeChart({ records }: ProcessTimeChartProps) {
  const chartData = useMemo(() => {
    const totalTimes = records.reduce(
      (acc, record) => {
        acc.centro += record.centroTime || 0;
        acc.torno += record.tornoTime || 0;
        acc.programacao += record.programacaoTime || 0;
        return acc;
      },
      { centro: 0, torno: 0, programacao: 0 }
    );
    
    return [
        { name: 'Centro', hours: parseFloat(totalTimes.centro.toFixed(1)), fill: "var(--color-centro)" },
        { name: 'Torno', hours: parseFloat(totalTimes.torno.toFixed(1)), fill: "var(--color-torno)" },
        { name: 'Programação', hours: parseFloat(totalTimes.programacao.toFixed(1)), fill: "var(--color-programacao)" }
    ];
  }, [records]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Horas Totais por Processo</CardTitle>
        <CardDescription>
          Soma das horas gastas em cada etapa da produção.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart
            data={chartData}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              unit="h"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="hours" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
