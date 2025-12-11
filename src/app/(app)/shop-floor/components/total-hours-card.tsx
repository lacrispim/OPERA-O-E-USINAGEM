'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type TotalHoursCardProps = {
  totalHours: number;
  usedHours: number;
};

export function TotalHoursCard({ totalHours, usedHours }: TotalHoursCardProps) {
  const remainingHours = Math.max(0, totalHours - usedHours);
  const percentageUsed = totalHours > 0 ? (usedHours / totalHours) * 100 : 0;

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Horas Mensais Disponíveis</CardTitle>
        <CardDescription>Total de horas disponíveis para produção no mês.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col justify-between h-[18.75rem] pt-2">
        <div className="flex-grow flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-bold tracking-tighter text-primary">
                {remainingHours.toFixed(1)}h
            </div>
            <p className="text-sm text-muted-foreground">de {totalHours}h restantes</p>
        </div>
        <div className="space-y-1">
            <div className="flex justify-between items-baseline">
                <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{usedHours.toFixed(1)}h</span> Utilizadas
                </p>
                <p className="text-xs font-bold text-muted-foreground">
                    {percentageUsed.toFixed(0)}%
                </p>
            </div>
            <Progress value={percentageUsed} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
