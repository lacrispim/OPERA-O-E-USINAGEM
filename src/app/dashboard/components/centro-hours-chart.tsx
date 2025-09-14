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

type CentroHoursChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  centroHours: {
    label: "Horas de Centro",
    color: "hsl(var(--chart-1))",
  },
};

export function CentroHoursChart({ records }: CentroHoursChartProps) {
    const chartData = useMemo(() => {
    const factoryData = records.reduce((acc, record) => {
      const factory = record.requestingFactory;
      if (!acc[factory]) {
        acc[factory] = { factory, centroHours: 0 };
      }
      acc[factory].centroHours += record.centroTime || 0;
      return acc;
    }, {} as Record<string, { factory: string; centroHours: number }>);

    return Object.values(factoryData);
  }, [records]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Horas de Centro por Fábrica</CardTitle>
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
              dataKey="centroHours"
              fill="var(--color-centroHours)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
