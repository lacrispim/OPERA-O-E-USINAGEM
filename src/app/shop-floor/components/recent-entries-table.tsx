'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OperatorProductionInput, StopReason } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type RecentEntriesTableProps = {
  entries: OperatorProductionInput[];
  stopReasons: StopReason[];
};

export function RecentEntriesTable({ entries, stopReasons }: RecentEntriesTableProps) {
  const getStopReasonText = (reasonId?: string) => {
    if (!reasonId) return <span className="text-muted-foreground">-</span>;
    const reason = stopReasons.find(r => r.id === reasonId);
    return reason ? <Badge variant="destructive">{reason.reason}</Badge> : <Badge variant="outline">Desconhecido</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registros Recentes</CardTitle>
        <CardDescription>Últimas entradas de produção registradas.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operador</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead>Nº Forms</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead>Parada</TableHead>
                <TableHead className="text-right">Horário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length > 0 ? (
                entries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{entry.operatorId}</TableCell>
                    <TableCell>{entry.machineId}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.formsNumber || '-'}</TableCell>
                    <TableCell className="text-center font-mono">{entry.quantityProduced}</TableCell>
                    <TableCell>{getStopReasonText(entry.stopReasonId)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true, locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum registro recente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
