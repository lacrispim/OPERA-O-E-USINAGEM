
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

type TornoHoursChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  tornoHours: {
    label: "Horas de Torno",
    color: "hsl(var(--chart-5))",
  },
};

const ALL_FACTORIES = ["Igarassu", "Vinhedo", "Suape", "Aguaí", "Garanhuns", "Indaiatuba", "Valinhos", "Pouso Alegre"];

export function TornoHoursChart({ records }: TornoHoursChartProps) {
  const chartData = useMemo(() => {
    const factoryData: Record<string, { factory: string; tornoHours: number }> = {};
    const factorySet = new Set(ALL_FACTORIES);

    // Initialize all factories
    factorySet.forEach(factory => {
        factoryData[factory] = { factory, tornoHours: 0 };
    });

    // Aggregate hours from records
    records.forEach(record => {
      const factory = record.requestingFactory;
      if (factoryData[factory]) {
        factoryData[factory].tornoHours += record.tornoTime || 0;
      }
    });

    return Object.values(factoryData);
  }, [records]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Horas de Torno por Fábrica</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <BarChart data={chartData} accessibilityLayer margin={{ bottom: 30, left: -20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="factory"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={10}
              angle={-45}
              textAnchor="end"
              interval={0}
              height={50}
            />
            <YAxis
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
