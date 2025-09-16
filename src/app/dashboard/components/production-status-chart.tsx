
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
  "Concluído": { label: "Concluído", color: "hsl(var(--chart-status-new-1))" },
  "Em andamento": { label: "Em Andamento", color: "hsl(var(--chart-status-new-2))" },
  "Em produção": { label: "Em Produção", color: "hsl(var(--chart-status-orange))" },
  "Pendente": { label: "Pendente", color: "hsl(var(--chart-status-new-4))" },
  "Fila de produção": { label: "Fila de Produção", color: "hsl(var(--chart-status-new-5))" },
  "Encerrada": { label: "Encerrada", color: "hsl(var(--chart-status-new-6))" },
  "TBD": { label: "TBD", color: "hsl(var(--border))" },
  "N/A": { label: "Não Aplicável", color: "hsl(var(--muted))" },
};

export function ProductionStatusChart({ records }: ProductionStatusChartProps) {
    const { chartData, totalRecords, legendPayload } = useMemo(() => {
        const allStatuses = Object.keys(chartConfig);
        
        // Initialize counts for all possible statuses
        const statusCounts = allStatuses.reduce((acc, status) => {
            acc[status] = 0;
            return acc;
        }, {} as Record<string, number>);
        
        // Aggregate counts from the filtered records
        records.forEach(record => {
            const status = record.status || 'N/A';
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            } else {
                // This handles unexpected statuses from data, though they won't have a color unless added to chartConfig
                if (!statusCounts[status]) statusCounts[status] = 0;
                statusCounts[status]++;
            }
        });

        // Data for the pie chart should only include items with a value > 0
        const chartData = Object.entries(statusCounts)
            .map(([name, value]) => ({ name, value }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value);
        
        const totalRecords = records.length;

        // The legend payload should include all statuses, showing 0 for those not in the current data
        const legendPayload = allStatuses.map(status => ({
            value: `${status} (${statusCounts[status]})`,
            type: 'square',
            id: status,
            color: chartConfig[status as keyof typeof chartConfig]?.color || 'hsl(var(--muted))'
        }));


        return { chartData, totalRecords, legendPayload };
    }, [records]);

    const getColor = (name: string) => {
        const config = chartConfig[name as keyof typeof chartConfig];
        if (config && 'color' in config) {
            return config.color;
        }
        return 'hsl(var(--muted))';
    }

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle className="text-lg">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-80">
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                labelLine={false}
                            >
                                {chartData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={getColor(entry.name)} />
                                ))}
                                <LabelList
                                    dataKey="value"
                                    position="inside"
                                    formatter={(value: number) => {
                                        if (totalRecords === 0) return "";
                                        const percentage = (value / totalRecords) * 100;
                                        if (percentage < 5) return ""; // Hide label for very small slices
                                        return `${percentage.toFixed(0)}%`;
                                    }}
                                    className="fill-white text-sm font-semibold"
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                     <ChartLegend
                        content={<ChartLegendContent payload={legendPayload} className="flex-col items-start gap-2" />}
                        className="flex justify-center"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
