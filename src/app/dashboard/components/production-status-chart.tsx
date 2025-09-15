
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

const ALL_STATUSES = ["Concluído", "Em produção", "Pendente", "Fila de produção", "Em andamento", "Encerrada", "TBD", "N/A"];

const chartConfig = {
  count: {
    label: "Quantidade",
  },
  "Concluído": {
    label: "Concluído",
    color: "hsl(var(--chart-2))",
  },
  "Em andamento": {
    label: "Em Andamento",
    color: "hsl(var(--chart-3))",
  },
  "Em produção": {
    label: "Em Produção",
    color: "hsl(var(--chart-4))",
  },
  "Pendente": {
    label: "Pendente",
    color: "hsl(var(--destructive))",
  },
  "Fila de produção": {
    label: "Fila de Produção",
    color: "hsl(var(--chart-5))",
  },
  "Encerrada": {
    label: "Encerrada",
    color: "hsl(var(--muted-foreground))",
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

export function ProductionStatusChart({ records }: ProductionStatusChartProps) {
    const { chartData, totalRecords } = useMemo(() => {
        const statusCounts: Record<string, number> = {};

        // Initialize all possible statuses with 0
        ALL_STATUSES.forEach(status => {
            statusCounts[status] = 0;
        });

        // Count statuses from records
        records.forEach((record) => {
            const status = record.status || 'N/A';
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status] += 1;
            } else {
                // If a status from data is not in our predefined list, we can add it
                // or handle it as 'N/A'. For now, let's add it.
                statusCounts[status] = 1;
            }
        });

        // Filter out statuses with 0 count to not clutter the chart itself,
        // but the legend will be based on the config. Or show all. Let's show all for now.
        const chartData = Object.entries(statusCounts).map(([name, value]) => ({
            name,
            value,
        }));
        
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
                            {pieData.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={getColor(entry.name)} />
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
                            content={<ChartLegendContent nameKey="name" payload={chartData.map(item => ({ value: item.name, color: getColor(item.name) }))} />}
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
