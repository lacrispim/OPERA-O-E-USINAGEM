'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ProductionLossInput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type RecentLossesTableProps = {
  entries: ProductionLossInput[];
  onDelete: (index: number) => void;
};

const formatTime = (totalMinutes: number) => {
    if (totalMinutes === undefined || totalMinutes === null) return '-';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
};

export function RecentLossesTable({ entries, onDelete }: RecentLossesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registros de Perdas Recentes</CardTitle>
        <CardDescription>Últimas entradas de perdas de produção.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operador</TableHead>
                <TableHead>Fábrica</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-center">Qtd. Peças Mortas</TableHead>
                <TableHead>Tempo Perdido</TableHead>
                <TableHead className="text-right">Data e Horário</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length > 0 ? (
                entries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{entry.operatorId}</TableCell>
                    <TableCell>{entry.factory}</TableCell>
                    <TableCell>{entry.machineId}</TableCell>
                    <TableCell>
                        <Badge variant="destructive">{entry.reason}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono text-red-500 font-bold">{entry.quantityLost}</TableCell>
                    <TableCell className="font-mono">{formatTime(entry.timeLostMinutes)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => onDelete(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Nenhum registro de perda recente.
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
