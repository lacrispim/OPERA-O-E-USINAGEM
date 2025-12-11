'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ProductionLossInput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ref, remove, query, orderByChild, limitToLast, onValue } from 'firebase/database';
import { useDatabase } from "@/firebase";
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

const formatDate = (timestamp: number | string) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString('pt-BR');
}


export function RecentLossesTable({ onDelete }: RecentLossesTableProps) {
  const database = useDatabase();
  const { toast } = useToast();
  const [entries, setEntries] = useState<ProductionLossInput[]>([]);

  useEffect(() => {
    if (!database) return;

    const lossesRef = ref(database, 'production-losses');
    const q = query(lossesRef, orderByChild('timestamp'), limitToLast(10));
    const unsubscribe = onValue(q, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const lossesArray = Object.keys(data).map(key => ({ 
                id: key, 
                ...data[key] 
            })).sort((a, b) => b.timestamp - a.timestamp);
            setEntries(lossesArray);
        } else {
            setEntries([]);
        }
    }, (error) => {
        console.error("Error fetching recent losses: ", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao carregar perdas',
            description: error.message || 'Não foi possível buscar os registros de perdas recentes.'
        })
    });

    return () => unsubscribe();
  }, [database, toast]);


  const handleDelete = (id: string) => {
    if (onDelete) {
        onDelete(id);
        return;
    }
    if (!database || !id) return;
    const lossRef = ref(database, `production-losses/${id}`);
    remove(lossRef)
      .then(() => {
        toast({
            variant: 'destructive',
            title: "Registro de Perda Removido!",
            description: "O registro de perda foi removido.",
        });
      })
      .catch((serverError) => {
        console.error("Error deleting document: ", serverError);
        toast({
          variant: 'destructive',
          title: "Erro ao remover",
          description: serverError.message || "Não foi possível remover o registro de perda.",
        });
      });
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
