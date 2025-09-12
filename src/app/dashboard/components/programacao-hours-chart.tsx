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
  const totalProgramacaoHours = useMemo(() => {
    return records.reduce((acc, record) => acc + (record.programacaoTime || 0), 0);
  }, [records]);

  const chartData = [{ name: "Total", programacaoHours: totalProgramacaoHours }];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horas Totais de Programação</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData} accessibilityLayer layout="vertical">
             <XAxis
              type="number"
              hide
            />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
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
              layout="vertical"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
