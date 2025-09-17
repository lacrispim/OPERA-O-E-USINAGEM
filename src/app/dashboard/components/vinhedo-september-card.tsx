
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

type VinhedoSeptemberCardProps = {
  quantity: number;
};

export function VinhedoSeptemberCard({ quantity }: VinhedoSeptemberCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Peças de Vinhedo (Setembro)
        </CardTitle>
        <Package className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {quantity.toLocaleString('pt-BR')}
        </div>
        <p className="text-xs text-muted-foreground">
          Total de peças produzidas em Setembro
        </p>
      </CardContent>
    </Card>
  );
}
