import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductionRecord } from "@/lib/types";
import { Package } from "lucide-react";

type TotalPiecesCardProps = {
  records: ProductionRecord[];
};

export function TotalPiecesCard({ records }: TotalPiecesCardProps) {
  const totalPieces = records.reduce((sum, record) => {
    // Ensure quantity is a number before adding
    const quantity = Number(record.quantity) || 0;
    return sum + quantity;
  }, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Total de Peças Produzidas
        </CardTitle>
        <Package className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {totalPieces.toLocaleString("pt-BR")}
        </div>
        <p className="text-xs text-muted-foreground">
          Soma de todas as quantidades registradas
        </p>
      </CardContent>
    </Card>
  );
}
