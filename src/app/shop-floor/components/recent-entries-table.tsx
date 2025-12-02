'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OperatorProductionInput } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type RecentEntriesTableProps = {
  entries: OperatorProductionInput[];
};

export function RecentEntriesTable({ entries }: RecentEntriesTableProps) {
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
                <TableHead>Fábrica</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead>Nº Forms</TableHead>
                <TableHead className="text-center">Produzido</TableHead>
                <TableHead className="text-center">Perdido</TableHead>
                <TableHead className="text-right">Horário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length > 0 ? (
                entries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{entry.operatorId}</TableCell>
                    <TableCell>{entry.factory}</TableCell>
                    <TableCell>{entry.machineId}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.formsNumber || '-'}</TableCell>
                    <TableCell className="text-center font-mono">{entry.quantityProduced}</TableCell>
                    <TableCell className="text-center font-mono">
                        {entry.quantityLost > 0 ? (
                            <Badge variant="destructive">{entry.quantityLost}</Badge>
                        ) : (
                            <span className="text-muted-foreground">{entry.quantityLost}</span>
                        )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true, locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
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
