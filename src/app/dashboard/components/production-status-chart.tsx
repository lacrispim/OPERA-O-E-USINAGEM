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

type ProductionStatusChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  'Concluído': { label: 'Concluído', color: 'hsl(var(--chart-status-1))' },
  'Em produção': { label: 'Em produção', color: 'hsl(var(--chart-status-orange))' },
  'Fila de produção': { label: 'Fila de produção', color: 'hsl(var(--chart-status-2))' },
  'Em andamento': { label: 'Em andamento', color: 'hsl(var(--chart-status-3))' },
  'Pendente': { label: 'Pendente', color: 'hsl(var(--chart-status-4))' },
  'Outro': { label: 'Outro', color: 'hsl(var(--chart-status-5))' },
};

export function ProductionStatusChart({ records }: ProductionStatusChartProps) {
    const { chartData, totalRecords } = useMemo(() => {
        const statusCounts = records.reduce((acc, record) => {
            const status = record.status || 'Outro';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(statusCounts).map(([name, value]) => ({
            name,
            value,
            fill: chartConfig[name as keyof typeof chartConfig]?.color || chartConfig['Outro'].color,
        }));
        
        const totalRecords = chartData.reduce((sum, item) => sum + item.value, 0);

        return { chartData, totalRecords };
    }, [records]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-80">
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel formatter={(value, name) => `${name}: ${value}`} />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            labelLine={false}
                        >
                            {chartData.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                            ))}
                            <LabelList
                                dataKey="value"
                                position="inside"
                                formatter={(value: number) => {
                                    if (totalRecords === 0) return "0%";
                                    const percentage = (value / totalRecords) * 100;
                                    return percentage > 5 ? `${percentage.toFixed(0)}%` : '';
                                }}
                                className="fill-white text-sm font-semibold"
                             />
                        </Pie>
                         <ChartLegend
                            content={<ChartLegendContent nameKey="name" />}
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{paddingLeft: 20}}
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
