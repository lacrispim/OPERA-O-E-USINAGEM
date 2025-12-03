'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OperatorProductionInput } from "@/lib/types";

type RecentEntriesTableProps = {
  entries: OperatorProductionInput[];
};

const formatTime = (totalSeconds: number) => {
    if (totalSeconds === undefined || totalSeconds === null) return '-';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

export function RecentEntriesTable({ entries }: RecentEntriesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registros de Produção Recentes</CardTitle>
        <CardDescription>Últimas entradas de produção bem-sucedida.</CardDescription>
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
                <TableHead className="text-center">Nº Operações</TableHead>
                <TableHead className="text-center">Produzido</TableHead>
                <TableHead>Tempo de Usinagem</TableHead>
                <TableHead className="text-right">Data e Horário</TableHead>
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
                    <TableCell className="text-center">{entry.operationCount || '-'}</TableCell>
                    <TableCell className="text-center font-mono text-green-500 font-bold">{entry.quantityProduced}</TableCell>
                    <TableCell className="font-mono">{formatTime(entry.productionTimeSeconds)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
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
