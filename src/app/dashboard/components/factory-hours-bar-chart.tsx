
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ProductionRecord } from "@/lib/types";
import { useMemo } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, LabelList, Tooltip, ReferenceLine, Label } from "recharts";

type FactoryHoursBarChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  hours: {
    label: "Total Horas",
    color: "hsl(195 100% 40%)", // Teal
  },
  cumulative: {
    label: "Cumulativo %",
    color: "hsl(var(--primary))",
  },
};

const ALL_FACTORIES = ["Igarassu", "Vinhedo", "Suape", "Aguaí", "Garanhuns", "Indaiatuba", "Valinhos", "Pouso Alegre"];

export function FactoryHoursBarChart({ records }: FactoryHoursBarChartProps) {
    const chartData = useMemo(() => {
        const factoryData: Record<string, number> = {};
        
        records.forEach(record => {
            const factory = record.requestingFactory;
            if (!factoryData[factory]) {
                factoryData[factory] = 0;
            }
            const totalRecordHours = (record.centroTime || 0) + (record.tornoTime || 0) + (record.programacaoTime || 0);
            factoryData[factory] += totalRecordHours;
        });

        const sortedData = Object.entries(factoryData)
            .map(([factory, hours]) => ({
                factory,
                hours: Number(hours.toFixed(1)),
            }))
            .sort((a, b) => b.hours - a.hours);

        const totalHours = sortedData.reduce((sum, item) => sum + item.hours, 0);

        if (totalHours === 0) {
            return ALL_FACTORIES.map(f => ({ factory: f, hours: 0, cumulative: 0 }));
        }

        let cumulativeHours = 0;
        const paretoData = sortedData.map(item => {
            cumulativeHours += item.hours;
            return {
                ...item,
                cumulative: Number(((cumulativeHours / totalHours) * 100).toFixed(0)),
            };
        });
        
        // Add factories with 0 hours to the end to ensure they are displayed
        const displayedFactories = new Set(paretoData.map(d => d.factory));
        ALL_FACTORIES.forEach(factory => {
            if (!displayedFactories.has(factory)) {
                paretoData.push({ factory, hours: 0, cumulative: 100 });
            }
        });

        return paretoData;
    }, [records]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Gráfico de Pareto - Horas por Fábrica</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-96 w-full">
                    <ComposedChart data={chartData} accessibilityLayer margin={{ top: 20, right: 20, bottom: 40, left: -10 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="factory"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            fontSize={10}
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                            height={60}
                        />
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            fontSize={10}
                            allowDecimals={false}
                            valueFormatter={(value) => `${value}h`}
                            label={{ value: 'Total Horas', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: '12px', fill: 'hsl(var(--foreground))' } }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            fontSize={10}
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                             label={{ value: 'Cumulativo %', angle: 90, position: 'insideRight', offset: 10, style: { fontSize: '12px', fill: 'hsl(var(--foreground))' } }}
                        />
                        <Tooltip
                            content={
                                <ChartTooltipContent 
                                    formatter={(value, name) => {
                                        if (name === "hours") return `${Number(value).toFixed(1)}h`;
                                        if (name === "cumulative") return `${value}%`;
                                        return String(value);
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <ReferenceLine 
                            y={60} 
                            yAxisId="left" 
                            stroke="hsl(var(--destructive))" 
                            strokeDasharray="3 3" 
                        >
                            <Label value="Limite (60h)" position="insideTopRight" fill="hsl(var(--destructive))" fontSize={10} />
                        </ReferenceLine>
                        <Bar
                            dataKey="hours"
                            yAxisId="left"
                            fill="var(--color-hours)"
                            radius={4}
                        >
                             <LabelList
                                dataKey="hours"
                                position="top"
                                offset={4}
                                className="fill-foreground"
                                fontSize={10}
                                formatter={(value: number) => value > 0 ? `${value.toFixed(1)}h` : ''}
                            />
                        </Bar>
                         <Line
                            type="monotone"
                            dataKey="cumulative"
                            yAxisId="right"
                            stroke="var(--color-cumulative)"
                            strokeWidth={2}
                            dot={{
                                fill: "var(--color-cumulative)",
                                r: 4
                            }}
                        />
                    </ComposedChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
