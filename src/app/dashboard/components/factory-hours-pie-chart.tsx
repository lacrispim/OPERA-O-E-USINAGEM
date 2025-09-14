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
import { Pie, PieChart, Cell } from "recharts";
import { LabelList } from "recharts";

type FactoryHoursPieChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  hours: {
    label: "Horas",
  },
  "Fábrica A": {
    label: "Fábrica A",
    color: "hsl(var(--chart-1))",
  },
  "Fábrica B": {
    label: "Fábrica B",
    color: "hsl(var(--chart-2))",
  },
  "Fábrica C": {
    label: "Fábrica C",
    color: "hsl(var(--chart-3))",
  },
};

const COLORS = Object.values(chartConfig)
    .filter(config => config.color)
    .map(config => config.color as string);

export function FactoryHoursPieChart({ records }: FactoryHoursPieChartProps) {
    const { chartData, totalHours } = useMemo(() => {
        const factoryData = records.reduce((acc, record) => {
            const factory = record.requestingFactory;
            if (!acc[factory]) {
                acc[factory] = 0;
            }
            const totalRecordHours = (record.centroTime || 0) + (record.tornoTime || 0) + (record.programacaoTime || 0);
            acc[factory] += totalRecordHours;
            return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(factoryData).map(([name, value]) => ({
            name,
            value: Number(value.toFixed(1)),
        }));
        
        const totalHours = chartData.reduce((sum, item) => sum + item.value, 0);

        return { chartData, totalHours };
    }, [records]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Distribuição de Horas por Fábrica (%)</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-64">
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel formatter={(value) => `${Number(value).toFixed(1)}h`} />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            labelLine={false}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <LabelList
                                dataKey="value"
                                position="inside"
                                formatter={(value: number) => {
                                    if (totalHours === 0) return "0%";
                                    return `${((value / totalHours) * 100).toFixed(0)}%`;
                                }}
                                className="fill-white text-sm font-semibold"
                             />
                        </Pie>
                         <ChartLegend
                            content={<ChartLegendContent nameKey="name" />}
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{paddingTop: 20}}
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
