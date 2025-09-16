
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

type ProgramacaoHoursChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  programacaoHours: {
    label: "Horas de Programação",
    color: "hsl(220 82% 52%)",
  },
};

const ALL_FACTORIES = ["Igarassu", "Vinhedo", "Suape", "Aguaí", "Garanhuns", "Indaiatuba", "Valinhos", "Pouso Alegre"];

export function ProgramacaoHoursChart({ records }: ProgramacaoHoursChartProps) {
  const chartData = useMemo(() => {
    const factoryData: Record<string, { factory: string; programacaoHours: number }> = {};
    const factorySet = new Set(ALL_FACTORIES);

    // Initialize all factories
    factorySet.forEach(factory => {
        factoryData[factory] = { factory, programacaoHours: 0 };
    });

    // Aggregate hours from records
    records.forEach(record => {
      const factory = record.requestingFactory;
      if (factoryData[factory]) {
        factoryData[factory].programacaoHours += record.programacaoTime || 0;
      }
    });

    return Object.values(factoryData).map(d => ({...d, programacaoHours: Number(d.programacaoHours.toFixed(1))}));
  }, [records]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Horas de Programação por Fábrica</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <BarChart data={chartData} accessibilityLayer margin={{ top: 20, bottom: 30, left: -20 }}>
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
              dataKey="programacaoHours"
              fill="var(--color-programacaoHours)"
              radius={4}
            >
                <LabelList
                    dataKey="programacaoHours"
                    position="top"
                    offset={4}
                    className="fill-foreground"
                    fontSize={10}
                    formatter={(value: number) => value > 0 ? `${value.toFixed(1)}h` : ''}
                />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
