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
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { format, startOfMonth } from "date-fns";
import { ptBR } from 'date-fns/locale';

type ProductionChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  productions: {
    label: "Produções",
    color: "hsl(var(--primary))",
  },
};

export function ProductionChart({ records }: ProductionChartProps) {
  const chartData = useMemo(() => {
    const monthlyData = records.reduce((acc, record) => {
      const month = format(startOfMonth(new Date(record.date)), "MMM/yy", { locale: ptBR });
      if (!acc[month]) {
        acc[month] = { month, productions: 0 };
      }
      acc[month].productions += 1;
      return acc;
    }, {} as Record<string, { month: string; productions: number }>);

    return Object.values(monthlyData).reverse();
  }, [records]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Volume de Produção Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData} accessibilityLayer>
            <XAxis
              dataKey="month"
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
              dataKey="productions"
              fill="var(--color-productions)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
