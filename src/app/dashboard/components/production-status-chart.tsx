
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ProductionRecord } from "@/lib/types";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, Cell } from "recharts";

type ProductionStatusChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  count: {
    label: "Quantidade",
  },
  "Concluído": { label: "Concluído", color: "hsl(var(--chart-status-alt-1))" },
  "Em andamento": { label: "Em Andamento", color: "hsl(var(--chart-status-alt-2))" },
  "Em produção": { label: "Em Produção", color: "hsl(var(--chart-status-orange))" },
  "Pendente": { label: "Pendente", color: "hsl(var(--chart-status-alt-4))" },
  "Fila de produção": { label: "Fila de Produção", color: "hsl(var(--chart-status-alt-5))" },
  "Encerrada": { label: "Encerrada", color: "hsl(var(--chart-status-alt-6))" },
  "TBD": { label: "TBD", color: "hsl(var(--border))" },
  "N/A": { label: "Não Aplicável", color: "hsl(var(--muted))" },
};

const ALL_STATUSES = Object.keys(chartConfig).filter(k => k !== 'count');

export function ProductionStatusChart({ records }: ProductionStatusChartProps) {
    const chartData = useMemo(() => {
        const statusCounts: Record<string, number> = {};
        ALL_STATUSES.forEach(status => {
            statusCounts[status] = 0;
        });

        records.forEach((record) => {
            const status = record.status || 'N/A';
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            } else {
                statusCounts[status] = 1; 
            }
        });

        return Object.entries(statusCounts)
            .map(([name, value]) => ({ 
                name, 
                value, 
                // @ts-ignore
                fill: chartConfig[name]?.color || 'hsl(var(--muted))' 
            }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value);
        
    }, [records]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-72 w-full">
                  <BarChart data={chartData} accessibilityLayer margin={{ top: 20, bottom: 30, left: -20 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={50}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={10}
                      allowDecimals={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="value" radius={4}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <LabelList
                          dataKey="value"
                          position="top"
                          offset={4}
                          className="fill-foreground"
                          fontSize={10}
                          formatter={(value: number) => value > 0 ? value.toLocaleString() : ''}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
