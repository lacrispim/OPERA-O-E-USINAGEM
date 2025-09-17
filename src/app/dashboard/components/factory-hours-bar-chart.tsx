
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

type FactoryHoursBarChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  totalHours: {
    label: "Total de Horas",
    color: "hsl(var(--primary))",
  },
};

const ALL_FACTORIES = ["Igarassu", "Vinhedo", "Suape", "Aguaí", "Garanhuns", "Indaiatuba", "Valinhos", "Pouso Alegre"];

export function FactoryHoursBarChart({ records }: FactoryHoursBarChartProps) {
    const chartData = useMemo(() => {
        const factoryData: Record<string, { factory: string; totalHours: number }> = {};

        // Initialize all factories with 0 hours
        ALL_FACTORIES.forEach(factory => {
            factoryData[factory] = { factory, totalHours: 0 };
        });
        
        // Aggregate hours from records
        records.forEach(record => {
            const factory = record.requestingFactory;
            if (factoryData.hasOwnProperty(factory)) {
                const totalRecordHours = (record.centroTime || 0) + (record.tornoTime || 0) + (record.programacaoTime || 0);
                factoryData[factory].totalHours += totalRecordHours;
            }
        });

        return Object.values(factoryData).map(d => ({...d, totalHours: Number(d.totalHours.toFixed(1))}));
    }, [records]);


    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Total de Horas por Fábrica</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-72 w-full">
                    <BarChart data={chartData} accessibilityLayer margin={{ top: 20, bottom: 30, left: -20 }}>
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
                            height={50}
                        />
                        <YAxis
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
                            dataKey="totalHours"
                            fill="var(--color-totalHours)"
                            radius={4}
                        >
                            <LabelList
                                dataKey="totalHours"
                                position="top"
                                offset={4}
                                className="fill-foreground"
                                fontSize={10}
                                formatter={(value: number) => value > 0 ? `${value.toFixed(1)}h` : ''}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
