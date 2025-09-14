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

type FactoryHoursBarChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  hours: {
    label: "Total Horas",
    color: "hsl(var(--chart-2))",
  },
};

export function FactoryHoursBarChart({ records }: FactoryHoursBarChartProps) {
    const chartData = useMemo(() => {
        const factoryData = records.reduce((acc, record) => {
            const factory = record.requestingFactory;
            if (!acc[factory]) {
                acc[factory] = 0;
            }
            const totalRecordHours = (record.centroTime || 0) + (record.tornoTime || 0) + (record.programacaoTime || 0);
            acc[factory] += totalRecordHours;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(factoryData).map(([factory, hours]) => ({
            factory,
            hours: Number(hours.toFixed(1)),
        }));
    }, [records]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Total de Horas por Fábrica</CardTitle>
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
                            dataKey="hours"
                            fill="var(--color-hours)"
                            radius={4}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
