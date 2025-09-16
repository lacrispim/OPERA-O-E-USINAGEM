
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
  count: {
    label: "Quantidade",
  },
  "Concluído": { label: "Concluído", color: "hsl(var(--chart-status-alt-1))" },
  "Em andamento": { label: "Em Andamento", color: "hsl(var(--chart-status-alt-2))" },
  "Em produção": { label: "Em Produção", color: "hsl(var(--chart-status-alt-3))" },
  "Pendente": { label: "Pendente", color: "hsl(var(--chart-status-alt-4))" },
  "Fila de produção": { label: "Fila de Produção", color: "hsl(var(--chart-status-alt-5))" },
  "Encerrada": { label: "Encerrada", color: "hsl(var(--chart-status-alt-6))" },
  "TBD": { label: "TBD", color: "hsl(var(--border))" },
  "N/A": { label: "Não Aplicável", color: "hsl(var(--muted))" },
};

const ALL_STATUSES = Object.keys(chartConfig).filter(k => k !== 'count');

const fallbackColors = [
    "hsl(215 70% 60%)", "hsl(225 90% 45%)", "hsl(205 85% 55%)",
    "hsl(230 75% 65%)", "hsl(210 80% 50%)", "hsl(220 82% 52%)",
];

export function ProductionStatusChart({ records }: ProductionStatusChartProps) {
    const { chartData, totalRecords } = useMemo(() => {
        const statusCounts: Record<string, number> = {};
        ALL_STATUSES.forEach(status => {
            statusCounts[status] = 0;
        });

        records.forEach((record) => {
            const status = record.status || 'N/A';
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            } else {
                statusCounts[status] = 1; // Should not happen if ALL_STATUSES is correct
            }
        });

        const chartData = Object.entries(statusCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
        
        const totalRecords = records.length;

        return { chartData, totalRecords };
    }, [records]);

    const getColor = (name: string, index: number) => {
        const config = chartConfig[name as keyof typeof chartConfig];
        return (config && 'color' in config) ? config.color : fallbackColors[index % fallbackColors.length];
    }
    
    const filteredChartData = chartData.filter(d => d.value > 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-8 p-4">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-64 flex-shrink-0">
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={filteredChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            labelLine={false}
                        >
                            {filteredChartData.map((entry, index) => (
                                <Cell key={`cell-${entry.name}`} fill={getColor(entry.name, index)} />
                            ))}
                             { totalRecords > 0 && (
                                <LabelList
                                    dataKey="value"
                                    position="inside"
                                    formatter={(value: number) => {
                                        if (totalRecords === 0) return "0%";
                                        const percentage = (value / totalRecords) * 100;
                                        if (percentage < 5) return "";
                                        return `${percentage.toFixed(0)}%`;
                                    }}
                                    className="fill-white text-sm font-semibold"
                                 />
                             )}
                        </Pie>
                    </PieChart>
                </ChartContainer>
                <div className="flex w-full sm:w-auto flex-col gap-2 text-sm">
                    <div className="font-medium text-muted-foreground">Legenda</div>
                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-8 gap-y-2">
                        {filteredChartData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: getColor(entry.name, index) }}
                                />
                                <div className="flex-1 truncate">{entry.name} ({entry.value})</div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
