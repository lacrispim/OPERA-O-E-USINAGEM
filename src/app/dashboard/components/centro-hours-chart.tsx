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

type CentroHoursChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  centroHours: {
    label: "Horas de Centro",
    color: "hsl(var(--chart-5))",
  },
};

export function CentroHoursChart({ records }: CentroHoursChartProps) {
  const chartData = useMemo(() => {
    const monthlyData = records.reduce((acc, record) => {
      const month = format(startOfMonth(new Date(record.date)), "MMM/yy", { locale: ptBR });
      if (!acc[month]) {
        acc[month] = { month, centroHours: 0 };
      }
      acc[month].centroHours += record.centroTime || 0;
      return acc;
    }, {} as Record<string, { month: string; centroHours: number }>);

    return Object.values(monthlyData).reverse();
  }, [records]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horas Totais de Centro por Mês</CardTitle>
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
              tickFormatter={(value) => `${value.toFixed(1)}h`}
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
