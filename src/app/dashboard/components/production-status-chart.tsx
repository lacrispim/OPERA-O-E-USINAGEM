
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
import { Pie, PieChart, Cell, LabelList } from "recharts";

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
    const { chartData, totalRecords } = useMemo(() => {
        const statusCounts = records.reduce((acc, record) => {
            const status = record.status || 'N/A';
            if (!acc[status]) {
                acc[status] = 0;
            }
            acc[status]++;
            return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(statusCounts)
            .map(([name, value]) => ({ name, value }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value);
        
        const totalRecords = chartData.reduce((sum, item) => sum + item.value, 0);

        return { chartData, totalRecords };
    }, [records]);

    const getColor = (name: string) => {
        const config = chartConfig[name as keyof typeof chartConfig];
        if (config && 'color' in config) {
            return config.color;
        }
        return 'hsl(var(--muted))';
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-64">
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
                            outerRadius={80}
                            labelLine={false}
                        >
                            {chartData.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={getColor(entry.name)} />
                            ))}
                            <LabelList
                                dataKey="value"
                                position="inside"
                                formatter={(value: number) => {
                                    if (totalRecords === 0) return "0%";
                                    return `${((value / totalRecords) * 100).toFixed(0)}%`;
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
