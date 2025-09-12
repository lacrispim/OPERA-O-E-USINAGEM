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

type SiteProductionChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  quantity: {
    label: "Quantidade",
    color: "hsl(var(--primary))",
  },
};

export function SiteProductionChart({ records }: SiteProductionChartProps) {
  const chartData = useMemo(() => {
    const siteData = records.reduce((acc, record) => {
      const site = record.requestingFactory;
      if (!acc[site]) {
        acc[site] = { site, quantity: 0 };
      }
      acc[site].quantity += record.quantity || 0;
      return acc;
    }, {} as Record<string, { site: string; quantity: number }>);

    return Object.values(siteData);
  }, [records]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quantidade de Peças por Site</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="site"
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
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
             <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="quantity"
              fill="var(--color-quantity)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
