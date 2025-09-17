
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProductionRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';

type TotalPiecesCardProps = {
  records: ProductionRecord[];
  className?: string;
};

export function TotalPiecesCard({ records, className }: TotalPiecesCardProps) {
  const totalPieces = useMemo(() => {
    return records.reduce((sum, record) => sum + (record.quantity || 0), 0);
  }, [records]);

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Total de Peças Produzidas
        </CardTitle>
        <Package className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {totalPieces.toLocaleString('pt-BR')}
        </div>
        <p className="text-xs text-muted-foreground">
          Soma de todas as peças no período selecionado.
        </p>
      </CardContent>
    </Card>
  );
}
