
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
  'Fila de produção': { label: 'Fila de produção', color: 'hsl(var(--chart-status-fila))' },
  'Em produção': { label: 'Em produção', color: 'hsl(var(--chart-status-producao))' },
  'TBD': { label: 'TBD', color: 'hsl(var(--chart-status-tbd))' },
  'Encerrada': { label: 'Encerrada', color: 'hsl(var(--chart-status-encerrada))' },
  'Outro': { label: 'Outro', color: 'hsl(var(--chart-status-outro))' },
};


export function ProductionStatusChart({ records }: ProductionStatusChartProps) {
    const { chartData, totalRecords } = useMemo(() => {
        const statusCounts: Record<string, number> = {};

        // Initialize all statuses from config to ensure they appear in the legend
        Object.keys(chartConfig).forEach(status => {
            statusCounts[status] = 0;
        });

        // Count records for each status
        records.forEach(record => {
            const status = record.status || 'Outro';
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            } else {
                 statusCounts['Outro']++;
            }
        });

        const chartData = Object.entries(statusCounts).map(([name, value]) => ({
            name,
            value,
            fill: chartConfig[name as keyof typeof chartConfig]?.color || chartConfig['Outro'].color,
        })).filter(item => item.value > 0); // Only show statuses with data in the chart itself
        
        const totalRecords = records.length;

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
                            outerRadius={80}
                            labelLine={false}
                        >
                            {chartData.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                            ))}
                            <LabelList
                                dataKey="value"
                                position="inside"
                                formatter={(value: number) => {
                                    if (totalRecords === 0 || value === 0) return "";
                                    const percentage = (value / totalRecords) * 100;
                                    return `${percentage.toFixed(0)}%`;
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
