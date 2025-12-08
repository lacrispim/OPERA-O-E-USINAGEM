
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ProductionLossInput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { parseISO } from "date-fns";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

type RecentLossesTableProps = {
  onDelete?: (id: string) => void;
};

const formatTime = (totalMinutes: number) => {
    if (totalMinutes === undefined || totalMinutes === null) return '-';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
};

const formatDate = (timestamp: Timestamp | string) => {
  if (!timestamp) return 'N/A';
  let date: Date;
  if (typeof timestamp === 'string') {
    date = parseISO(timestamp);
  } else if (timestamp.toDate) {
    date = timestamp.toDate();
  } else {
    return 'Data inválida';
  }
  return date.toLocaleString('pt-BR');
}


export function RecentLossesTable({ onDelete }: RecentLossesTableProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { data: entries } = useCollection<ProductionLossInput>(
    'production-losses',
    { constraints: [{type: 'orderBy', field: 'timestamp', direction: 'desc'}, {type: 'limit', value: 10}] }
  );

  const handleDelete = async (id: string) => {
    if (onDelete) {
        onDelete(id);
        return;
    }
    if (!firestore) return;
    const lossRef = doc(firestore, 'production-losses', id);
    try {
      await deleteDoc(lossRef);
      toast({
          variant: 'destructive',
          title: "Registro de Perda Removido!",
          description: "O registro de perda foi removido.",
      });
    } catch(error) {
      console.error("Error deleting document: ", error);
      toast({
        variant: 'destructive',
        title: "Erro ao remover",
        description: "Não foi possível remover o registro de perda.",
      });
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Registros de Perdas Recentes</CardTitle>
        <CardDescription>Últimas 10 entradas de perdas de produção.</CardDescription>
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
              {entries && entries.length > 0 ? (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.operatorId}</TableCell>
                    <TableCell>{entry.factory}</TableCell>
                    <TableCell>{entry.machineId}</TableCell>
                    <TableCell>
                        <Badge variant="destructive">{entry.reason}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono text-red-500 font-bold">{entry.quantityLost}</TableCell>
                    <TableCell className="font-mono">{formatTime(entry.timeLostMinutes)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(entry.timestamp)}
                    </TableCell>
                    <TableCell className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
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
