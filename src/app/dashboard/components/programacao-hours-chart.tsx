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

type ProgramacaoHoursChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  programacaoHours: {
    label: "Horas de Programação",
    color: "hsl(var(--chart-4))",
  },
};

export function ProgramacaoHoursChart({ records }: ProgramacaoHoursChartProps) {
  const chartData = useMemo(() => {
    const monthlyData = records.reduce((acc, record) => {
      const month = format(startOfMonth(new Date(record.date)), "MMM/yy", { locale: ptBR });
      if (!acc[month]) {
        acc[month] = { month, programacaoHours: 0 };
      }
      acc[month].programacaoHours += record.programacaoTime || 0;
      return acc;
    }, {} as Record<string, { month: string; programacaoHours: number }>);

    return Object.values(monthlyData).reverse();
  }, [records]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horas Totais de Programação por Mês</CardTitle>
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
              dataKey="programacaoHours"
              fill="var(--color-programacaoHours)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
