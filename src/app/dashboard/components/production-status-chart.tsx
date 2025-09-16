
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
  count: {
    label: "Quantidade",
  },
  "Concluído": {
    label: "Concluído",
    color: "hsl(var(--chart-status-1))",
  },
  "Em andamento": {
    label: "Em Andamento",
    color: "hsl(var(--chart-status-2))",
  },
  "Em produção": {
    label: "Em Produção",
    color: "hsl(var(--chart-status-3))",
  },
  "Pendente": {
    label: "Pendente",
    color: "hsl(var(--chart-status-4))",
  },
  "Fila de produção": {
    label: "Fila de Produção",
    color: "hsl(var(--chart-status-5))",
  },
  "Encerrada": {
    label: "Encerrada",
    color: "hsl(var(--chart-status-6))",
  },
  "TBD": {
    label: "TBD",
    color: "hsl(var(--border))",
  },
  "N/A": {
    label: "Não Aplicável",
    color: "hsl(var(--muted))",
  }
};

const ALL_STATUSES = Object.keys(chartConfig).filter(k => k !== 'count');

const fallbackColors = [
    "hsl(215 70% 60%)",
    "hsl(225 90% 45%)",
    "hsl(205 85% 55%)",
    "hsl(230 75% 65%)",
    "hsl(210 80% 50%)",
    "hsl(220 82% 52%)",
];

export function ProductionStatusChart({ records }: ProductionStatusChartProps) {
    const { chartData, totalRecords } = useMemo(() => {
        // Initialize all known statuses with 0 count
        const statusCounts: Record<string, number> = {};
        ALL_STATUSES.forEach(status => {
            statusCounts[status] = 0;
        });

        // Aggregate counts from records
        records.forEach((record) => {
            const status = record.status || 'N/A';
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            } else {
                // If a status from data is not in our config, add it
                statusCounts[status] = 1;
            }
        });

        const chartData = Object.entries(statusCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Keep sorting to have larger slices together
        
        const totalRecords = records.length;

        return { chartData, totalRecords };
    }, [records]);

    const getColor = (name: string, index: number) => {
        const config = chartConfig[name as keyof typeof chartConfig];
        if (config && 'color' in config) {
            return config.color;
        }
        return fallbackColors[index % fallbackColors.length];
    }
    
    // Filtered data for the Pie, to avoid showing 0-value slices which can look weird.
    const pieData = chartData.filter(d => d.value > 0);

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
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            labelLine={false}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${entry.name}`} fill={getColor(entry.name, index)} />
                            ))}
                            { totalRecords > 0 && (
                                <LabelList
                                    dataKey="value"
                                    position="inside"
                                    formatter={(value: number) => {
                                        if (totalRecords === 0) return "0%";
                                        const percentage = (value / totalRecords) * 100;
                                        // Don't show label for small percentages
                                        if (percentage < 5) return "";
                                        return `${percentage.toFixed(0)}%`;
                                    }}
                                    className="fill-white text-sm font-semibold"
                                 />
                             )}
                        </Pie>
                         <ChartLegend
                            content={<ChartLegendContent nameKey="name" payload={chartData.map((entry, index) => ({
                                value: `${entry.name} (${entry.value})`,
                                color: getColor(entry.name, index),
                                type: 'circle',
                            }))} />}
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
