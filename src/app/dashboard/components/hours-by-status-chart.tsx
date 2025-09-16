
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ProductionRecord } from "@/lib/types";
import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";

type HoursByStatusChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  hours: {
    label: "Horas",
  },
  'Fila de produção': { color: 'hsl(var(--chart-status-fila))' },
  'Em produção': { color: 'hsl(var(--chart-status-producao))' },
  'TBD': { color: 'hsl(var(--chart-status-tbd))' },
  'Encerrada': { color: 'hsl(var(--chart-status-encerrada))' },
  'Outro': { color: 'hsl(var(--chart-status-outro))' },
};


export function HoursByStatusChart({ records }: HoursByStatusChartProps) {
    const { chartData, totalHours } = useMemo(() => {
        const statusHours: Record<string, number> = {};

        Object.keys(chartConfig).forEach(status => {
            if(status !== 'hours') statusHours[status] = 0;
        });

        records.forEach(record => {
            const status = record.status || 'Outro';
            const totalRecordHours = (record.centroTime || 0) + (record.tornoTime || 0) + (record.programacaoTime || 0);
            if (statusHours.hasOwnProperty(status)) {
                statusHours[status] += totalRecordHours;
            } else {
                 statusHours['Outro'] += totalRecordHours;
            }
        });

        const chartData = Object.entries(statusHours).map(([name, hours]) => ({
            name,
            hours: Number(hours.toFixed(1)),
            fill: chartConfig[name as keyof typeof chartConfig]?.color || chartConfig['Outro'].color,
        })).filter(item => item.hours > 0).sort((a,b) => b.hours - a.hours);
        
        const totalHours = chartData.reduce((sum, item) => sum + item.hours, 0);

        return { chartData, totalHours };
    }, [records]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Total de Horas por Status</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-96 w-full">
                    <BarChart 
                        data={chartData} 
                        accessibilityLayer 
                        layout="vertical"
                        margin={{ left: 20, right: 60 }}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            fontSize={12}
                            width={100}
                        />
                        <XAxis
                            dataKey="hours"
                            type="number"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            fontSize={10}
                            allowDecimals={false}
                            valueFormatter={(value) => `${value}h`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" formatter={(value) => `${Number(value).toFixed(1)}h`} />}
                        />
                        <Bar
                            dataKey="hours"
                            radius={4}
                            barSize={35}
                        >
                            <LabelList
                                dataKey="hours"
                                position="right"
                                offset={8}
                                className="fill-foreground"
                                fontSize={12}
                                formatter={(value: number) => {
                                    if (totalHours === 0 || value === 0) return "";
                                    const percentage = (value / totalHours) * 100;
                                    return `${percentage.toFixed(0)}% (${value.toFixed(1)}h)`;
                                }}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
