
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProductionRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

type UniqueRequestsCardProps = {
  records: ProductionRecord[];
  className?: string;
};

export function UniqueRequestsCard({ records, className }: UniqueRequestsCardProps) {
  const uniqueRequestCount = useMemo(() => {
    const requestIds = new Set(records.map(record => record.requestId).filter(Boolean));
    return requestIds.size;
  }, [records]);

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Número de Requisições Planejadas
        </CardTitle>
        <FileText className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {uniqueRequestCount.toLocaleString('pt-BR')}
        </div>
        <p className="text-xs text-muted-foreground">
          Total de requisições distintas no período.
        </p>
      </CardContent>
    </Card>
  );
}
