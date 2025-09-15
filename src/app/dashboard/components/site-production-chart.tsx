
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

type SiteProductionChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  quantity: {
    label: "Quantidade",
    color: "hsl(var(--primary))",
  },
};

const ALL_FACTORIES = ["Igarassu", "Vinhedo", "Suape", "Aguaí", "Garanhuns", "Indaiatuba", "Valinhos", "Pouso Alegre"];

export function SiteProductionChart({ records }: SiteProductionChartProps) {
  const chartData = useMemo(() => {
    // Initialize all known factories with 0 quantity
    const siteData: Record<string, { site: string; quantity: number }> = {};
    const factorySet = new Set(ALL_FACTORIES);

    factorySet.forEach(factory => {
        siteData[factory] = { site: factory, quantity: 0 };
    });

    // Aggregate quantities from records
    records.forEach(record => {
      const site = record.requestingFactory;
      if (siteData[site]) {
        siteData[site].quantity += record.quantity || 0;
      }
    });

    return Object.values(siteData);
  }, [records]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quantidade de Peças por Fábrica</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <BarChart data={chartData} accessibilityLayer margin={{ top: 20, bottom: 30, left: -20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="site"
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
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="quantity"
              fill="var(--color-quantity)"
              radius={4}
            >
                <LabelList
                    dataKey="quantity"
                    position="top"
                    offset={4}
                    className="fill-foreground"
                    fontSize={10}
                    formatter={(value: number) => value.toLocaleString()}
                />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
