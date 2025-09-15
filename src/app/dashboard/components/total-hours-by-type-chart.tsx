'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ProductionRecord } from "@/lib/types";
import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";

type TotalHoursByTypeChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  hours: {
    label: "Horas",
  },
  centro: {
    label: "Centro",
    color: "hsl(var(--chart-4))",
  },
  torno: {
    label: "Torno",
    color: "hsl(var(--chart-5))",
  },
  programacao: {
    label: "Programação",
    color: "hsl(220 82% 52%)",
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
      { type: "Centro", hours: Number(totals.centro.toFixed(1)), fill: "var(--color-centro)" },
      { type: "Torno", hours: Number(totals.torno.toFixed(1)), fill: "var(--color-torno)" },
      { type: "Programação", hours: Number(totals.programacao.toFixed(1)), fill: "var(--color-programacao)" },
    ];
  }, [records]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Total de Horas por Tipo de Processo</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart 
            data={chartData} 
            accessibilityLayer 
            layout="vertical"
            margin={{ left: 20, right: 40 }} // Added right margin for labels
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="type"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={10}
              width={80}
            />
            <XAxis
              dataKey="hours"
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={10}
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
            >
                <LabelList
                    dataKey="hours"
                    position="right"
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: number) => `${value.toFixed(1)}h`}
                />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
