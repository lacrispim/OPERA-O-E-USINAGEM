'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type TornoHoursChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  tornoHours: {
    label: "Horas de Torno",
    color: "hsl(var(--chart-3))",
  },
};

export function TornoHoursChart({ records }: TornoHoursChartProps) {
  const chartData = useMemo(() => {
    const factoryData = records.reduce((acc, record) => {
      const factory = record.requestingFactory;
      if (!acc[factory]) {
        acc[factory] = { factory, tornoHours: 0 };
      }
      acc[factory].tornoHours += record.tornoTime || 0;
      return acc;
    }, {} as Record<string, { factory: string; tornoHours: number }>);

    return Object.values(factoryData);
  }, [records]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Horas de Torno por Fábrica</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="factory"
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
              allowDecimals={false}
              valueFormatter={(value) => `${value}h`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" formatter={(value) => `${Number(value).toFixed(1)}h`} />}
            />
             <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="tornoHours"
              fill="var(--color-tornoHours)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
