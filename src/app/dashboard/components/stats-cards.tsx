import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductionRecord } from "@/lib/types";
import { BarChart, Clock, Hash, Package } from "lucide-react";

type StatsCardsProps = {
  records: ProductionRecord[];
};

export function StatsCards({ records }: StatsCardsProps) {
  const totalProductions = records.length;
  const averageTime =
    records.reduce((acc, r) => acc + r.manufacturingTime, 0) /
    (totalProductions || 1);
  const uniqueParts = new Set(records.map((r) => r.partName)).size;
  const uniqueMaterials = new Set(records.map((r) => r.material)).size;

  const stats = [
    {
      title: "Total de Produções",
      value: totalProductions.toLocaleString(),
      icon: BarChart,
    },
    {
      title: "Tempo Médio (h)",
      value: averageTime.toFixed(1),
      icon: Clock,
    },
    {
      title: "Peças Únicas",
      value: uniqueParts.toLocaleString(),
      icon: Package,
    },
    {
      title: "Materiais Distintos",
      value: uniqueMaterials.toLocaleString(),
      icon: Hash,
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
