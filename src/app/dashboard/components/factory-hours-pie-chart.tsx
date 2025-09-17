
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

type FactoryHoursPieChartProps = {
  records: ProductionRecord[];
};

const ALL_FACTORIES = ["Igarassu", "Vinhedo", "Suape", "Aguaí", "Garanhuns", "Indaiatuba", "Valinhos", "Pouso Alegre"];

const chartConfig = {
  hours: {
    label: "Horas",
  },
  "Igarassu": { label: "Igarassu", color: "hsl(var(--chart-1))" },
  "Vinhedo": { label: "Vinhedo", color: "hsl(var(--chart-2))" },
  "Suape": { label: "Suape", color: "hsl(var(--chart-3))" },
  "Aguaí": { label: "Aguaí", color: "hsl(var(--chart-4))" },
  "Garanhuns": { label: "Garanhuns", color: "hsl(var(--chart-5))" },
  "Indaiatuba": { label: "Indaiatuba", color: "hsl(220 82% 52%)" },
  "Valinhos": { label: "Valinhos", color: "hsl(340 82% 52%)" },
  "Pouso Alegre": { label: "Pouso Alegre", color: "hsl(160 82% 42%)" },
};

export function FactoryHoursPieChart({ records }: FactoryHoursPieChartProps) {
    const { chartData, totalHours } = useMemo(() => {
        const factoryData: Record<string, number> = {};

        // Initialize all factories with 0 hours
        ALL_FACTORIES.forEach(factory => {
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

        const chartData = Object.entries(factoryData).map(([name, value]) => ({
            name,
            value: Number(value.toFixed(1)),
        }));
        
        const totalHours = chartData.reduce((sum, item) => sum + item.value, 0);

        return { chartData, totalHours };
    }, [records]);

    const getColor = (name: string) => {
        const config = chartConfig[name as keyof typeof chartConfig];
        if (config && 'color' in config) {
            return config.color;
        }
        return 'hsl(var(--muted))';
    }
    
    // Filter out items with 0 value for the pie chart slices, but keep them for the legend
    const pieData = chartData.filter(item => item.value > 0);


    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Distribuição de Horas por Fábrica (%)</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-64">
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel formatter={(value) => `${Number(value).toFixed(1)}h`} />}
                        />
                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            labelLine={false}
                        >
                            {pieData.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={getColor(entry.name)} />
                            ))}
                            <LabelList
                                dataKey="value"
                                position="inside"
                                formatter={(value: number) => {
                                    if (totalHours === 0 || value === 0) return "";
                                    const percentage = (value / totalHours) * 100;
                                    if (percentage < 5) return ""; // Hide label for very small slices
                                    return `${percentage.toFixed(0)}%`;
                                }}
                                className="fill-white text-sm font-semibold"
                             />
                        </Pie>
                         <ChartLegend
                            content={<ChartLegendContent payload={chartData.map(item => ({ value: item.name, type: 'square', color: getColor(item.name) }))} nameKey="value" />}
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
