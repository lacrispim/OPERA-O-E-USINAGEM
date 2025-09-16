
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ProductionRecord } from "@/lib/types";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Tooltip, ReferenceLine, Label, Legend } from "recharts";

type FactoryHoursBarChartProps = {
  records: ProductionRecord[];
};

const chartConfig = {
  hours: {
    label: "Total Horas",
    color: "hsl(195 100% 40%)", // Teal
  },
  availableHours: {
    label: "Horas Disponíveis",
    color: "hsl(var(--destructive))",
  }
};

const ALL_FACTORIES = ["Igarassu", "Vinhedo", "Suape", "Aguaí", "Garanhuns", "Indaiatuba", "Valinhos", "Pouso Alegre"];
const AVAILABLE_HOURS = 70;

const CustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="flex justify-center items-center gap-4" style={{ paddingTop: 30 }}>
      {payload.map((entry: any, index: any) => (
        <div key={`item-${index}`} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5" style={{ backgroundColor: entry.color }}></span>
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
       <div className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 10 2" className="h-2.5 w-2.5">
                <line x1="0" y1="1" x2="10" y2="1" stroke="white" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
            <span className="text-sm text-muted-foreground">Horas Disponíveis</span>
        </div>
    </div>
  );
};


export function FactoryHoursBarChart({ records }: FactoryHoursBarChartProps) {
    const chartData = useMemo(() => {
        const factoryData: Record<string, number> = {};
        
        // Initialize all factories to ensure they are displayed
        ALL_FACTORIES.forEach(factory => {
            factoryData[factory] = 0;
        });
        
        records.forEach(record => {
            const factory = record.requestingFactory;
            if (factoryData.hasOwnProperty(factory)) {
                const totalRecordHours = (record.centroTime || 0) + (record.tornoTime || 0) + (record.programacaoTime || 0);
                factoryData[factory] += totalRecordHours;
            }
        });

        return Object.entries(factoryData)
            .map(([factory, hours]) => ({
                factory,
                hours: Number(hours.toFixed(1)),
            }))
            .sort((a, b) => b.hours - a.hours);

    }, [records]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Horas por Fábrica</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-96 w-full">
                    <BarChart data={chartData} accessibilityLayer margin={{ top: 20, right: 20, bottom: 40, left: -10 }}>
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
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            fontSize={10}
                            allowDecimals={false}
                            valueFormatter={(value) => `${value}h`}
                            label={{ value: 'Total Horas', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: '12px', fill: 'hsl(var(--foreground))' } }}
                        />
                        <Tooltip
                            content={
                                <ChartTooltipContent 
                                    formatter={(value) => `${Number(value).toFixed(1)}h`}
                                    indicator="dot"
                                />
                            }
                        />
                         <Legend content={<CustomLegend />} />
                        <ReferenceLine 
                            y={AVAILABLE_HOURS}
                            stroke="white" 
                            strokeDasharray="3 3" 
                        >
                            <Label value="Horas Disponíveis" position="insideTopRight" fill="white" fontSize={10} />
                        </ReferenceLine>
                        <Bar
                            dataKey="hours"
                            fill="var(--color-hours)"
                            radius={4}
                            name="Total Horas"
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
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
