
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
    color: "hsl(var(--chart-2))",
  },
  "Em produção": {
    label: "Em Produção",
    color: "hsl(var(--chart-3))",
  },
  "Pendente": {
    label: "Pendente",
    color: "hsl(var(--chart-1))",
  },
  "Fila de produção": {
    label: "Fila de Produção",
    color: "hsl(var(--chart-4))",
  },
  "Em andamento": {
    label: "Em Andamento",
    color: "hsl(var(--chart-5))",
  },
  "N/A": {
    label: "Não Aplicável",
    color: "hsl(var(--muted))",
  }
};

export function ProductionStatusChart({ records }: ProductionStatusChartProps) {
    const { chartData, totalRecords } = useMemo(() => {
        const statusCounts = records.reduce((acc, record) => {
            const status = record.status || 'N/A';
            if (!acc[status]) {
                acc[status] = 0;
            }
            acc[status] += 1;
            return acc;
        }, {} as Record<string, number>);

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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
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
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
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
