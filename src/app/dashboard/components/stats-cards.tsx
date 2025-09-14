import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductionRecord } from "@/lib/types";
import { BarChart, Boxes } from "lucide-react";

type StatsCardsProps = {
  records: ProductionRecord[];
};

export function StatsCards({ records }: StatsCardsProps) {
  const totalProductions = records.length;
  const totalQuantity = records.reduce((acc, r) => acc + (r.quantity || 0), 0);

  const stats = [
    {
      title: "Total de Produções",
      value: totalProductions.toLocaleString(),
      icon: BarChart,
    },
    {
        title: "Total de Peças",
        value: totalQuantity.toLocaleString(),
        icon: Boxes,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
