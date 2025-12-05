
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OperatorProductionInput, ProductionStatus, productionStatuses } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Timestamp } from 'firebase/firestore';

type RecentEntriesTableProps = {
  entries: OperatorProductionInput[];
  onUpdateStatus: (id: string, newStatus: ProductionStatus) => void;
  onDelete: (id: string) => void;
};

const formatTime = (totalSeconds: number) => {
    if (totalSeconds === undefined || totalSeconds === null) return '-';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

const getStatusBadgeVariant = (status: ProductionStatus) => {
    switch (status) {
        case 'Encerrado':
            return 'default';
        case 'Enviado':
            return 'sent';
        case 'Em produção':
            return 'in-progress';
        case 'Fila de produção':
            return 'secondary';
        case 'Rejeitado':
            return 'error';
        default:
            return 'outline';
    }
}

const formatDate = (timestamp: Timestamp | string) => {
  if (!timestamp) return 'N/A';
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toLocaleString('pt-BR');
  }
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleString('pt-BR');
  }
  return 'Data inválida';
}


export function RecentEntriesTable({ entries, onUpdateStatus, onDelete }: RecentEntriesTableProps) {
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Data e Horário</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.operatorId}</TableCell>
                    <TableCell>{entry.factory}</TableCell>
                    <TableCell>{entry.machineId}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.formsNumber || '-'}</TableCell>
                    <TableCell className="text-center">{entry.operationCount || '-'}</TableCell>
                    <TableCell className="text-center font-mono text-green-500 font-bold">{entry.quantityProduced}</TableCell>
                    <TableCell className="font-mono">{formatTime(entry.productionTimeSeconds)}</TableCell>
                    <TableCell>
                        <Select 
                            value={entry.status} 
                            onValueChange={(newStatus) => onUpdateStatus(entry.id, newStatus as ProductionStatus)}
                        >
                            <SelectTrigger className={cn("w-[180px] h-8 text-xs", 
                                (entry.status === 'Encerrado') && "bg-green-600/20 border-green-600 text-green-700",
                                (entry.status === 'Enviado') && "bg-violet-600/20 border-violet-500 text-violet-600",
                                entry.status === 'Em produção' && "bg-orange-500/20 border-orange-500 text-orange-600",
                                entry.status === 'Fila de produção' && "bg-blue-500/20 border-blue-500 text-blue-600",
                                entry.status === 'Rejeitado' && "bg-red-600/20 border-red-500 text-red-600",
                            )}>
                                <SelectValue>
                                    <Badge variant={getStatusBadgeVariant(entry.status)} className="text-xs">{entry.status}</Badge>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {productionStatuses.map(status => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(entry.timestamp)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" onClick={() => onDelete(entry.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
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
