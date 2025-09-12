'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { ProductionRecord } from "@/lib/types";
import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";

type ProcessTimeChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
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
        { process: 'Centro', hours: parseFloat(totalTimes.centro.toFixed(1)) },
        { process: 'Torno', hours: parseFloat(totalTimes.torno.toFixed(1)) },
        { process: 'Programação', hours: parseFloat(totalTimes.programacao.toFixed(1)) }
    ];
  }, [records]);

  const dataForChart = [
      {
          name: 'Total Horas',
          centro: chartData.find(d => d.process === 'Centro')?.hours || 0,
          torno: chartData.find(d => d.process === 'Torno')?.hours || 0,
          programacao: chartData.find(d => d.process === 'Programação')?.hours || 0,
      }
  ]

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
            data={dataForChart}
            layout="vertical"
            accessibilityLayer
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              hide
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="centro" fill="var(--color-centro)" radius={4} stackId="a" />
            <Bar dataKey="torno" fill="var(--color-torno)" radius={4} stackId="a" />
            <Bar dataKey="programacao" fill="var(--color-programacao)" radius={4} stackId="a" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
