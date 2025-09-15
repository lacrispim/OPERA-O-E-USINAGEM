
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ProductionRecord } from "@/lib/types";
import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ReferenceLine, Label, LabelList } from "recharts";

type FactoryHoursBarChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  hours: {
    label: "Total Horas",
    color: "hsl(221.2 83.2% 53.3%)", // Petrol Blue
  },
};

const ALL_FACTORIES = ["Igarassu", "Vinhedo", "Suape", "Aguaí", "Garanhuns", "Indaiatuba", "Valinhos", "Pouso Alegre"];

export function FactoryHoursBarChart({ records }: FactoryHoursBarChartProps) {
    const chartData = useMemo(() => {
        // Initialize all known factories with 0 hours
        const factoryData: Record<string, number> = {};
        const factorySet = new Set(ALL_FACTORIES);

        factorySet.forEach(factory => {
            factoryData[factory] = 0;
        });
        
        // Aggregate hours from records
        records.forEach(record => {
            const factory = record.requestingFactory;
            if (factoryData.hasOwnProperty(factory)) {
                const totalRecordHours = (record.centroTime || 0) + (record.tornoTime || 0) + (record.programacaoTime || 0);
                factoryData[factory] += totalRecordHours;
            }
        });

        return Object.entries(factoryData).map(([factory, hours]) => ({
            factory,
            hours: Number(hours.toFixed(1)),
        }));
    }, [records]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Total de Horas por Fábrica</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-72 w-full">
                    <BarChart data={chartData} accessibilityLayer margin={{ top: 20, bottom: 20 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="factory"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            fontSize={10}
                            angle={-45}
                            textAnchor="end"
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
                        <ReferenceLine y={60} stroke="red" strokeDasharray="3 3">
                            <Label value="Horas disponíveis" position="insideTopRight" fill="red" fontSize={12} />
                        </ReferenceLine>
                        <Bar
                            dataKey="hours"
                            fill="var(--color-hours)"
                            radius={4}
                        >
                             <LabelList
                                dataKey="hours"
                                position="top"
                                offset={4}
                                className="fill-foreground"
                                fontSize={10}
                                formatter={(value: number) => `${value.toFixed(1)}h`}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
