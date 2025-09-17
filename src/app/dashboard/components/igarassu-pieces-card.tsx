
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

type IgarassuPiecesCardProps = {
  totalPieces: number;
};

export function IgarassuPiecesCard({ totalPieces }: IgarassuPiecesCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Peças Produzidas (Igarassu)</CardTitle>
        <Package className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {totalPieces.toLocaleString('pt-BR')}
        </div>
        <p className="text-xs text-muted-foreground">
          Total de unidades com filtros aplicados
        </p>
      </CardContent>
    </Card>
  );
}
