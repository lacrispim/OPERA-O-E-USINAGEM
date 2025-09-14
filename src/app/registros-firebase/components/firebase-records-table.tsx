'use client';

import { useEffect, useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const PREFERRED_COLUMN_ORDER = [
    "Site",
    "Data",
    "Material",
    "Nome da peça",
    "Quantidade",
    "Requisição",
    "Centro (minutos)",
    "Status",
    "Torno (minutos)",
    "Programação (minutos)",
    "Observação"
];

const NUMERIC_COLUMNS = ["Quantidade", "Requisição", "Centro (minutos)", "Torno (minutos)", "Programação (minutos)"];

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const s = status.toLowerCase();
    if (s.includes('concluído')) return 'default';
    if (s.includes('produção') || s.includes('andamento')) return 'secondary';
    if (s.includes('pendente')) return 'destructive';
    return 'outline';
}

export function FirebaseRecordsTable() {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nodePath = '12dXywY4L-NXhuKxJe9TuXBo-C4dtvcaWlPm6LdHeP5U/Página1';
    const nodeRef = ref(database, nodePath);

    const unsubscribe = onValue(
      nodeRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const rawData = snapshot.val();
          const dataArray = Object.keys(rawData).map((key) => ({
            id: key,
            ...rawData[key],
          }));

          const allHeaders = new Set<string>();
            dataArray.forEach(item => {
                Object.keys(item).forEach(key => {
                    if(key !== 'id') {
                      allHeaders.add(key);
                    }
                })
            });

          const sortedHeaders = PREFERRED_COLUMN_ORDER.filter(h => allHeaders.has(h));
          const remainingHeaders = Array.from(allHeaders).filter(h => !PREFERRED_COLUMN_ORDER.includes(h));
          const finalHeaders = [...sortedHeaders, ...remainingHeaders];

          setHeaders(finalHeaders);
          setData(dataArray);
        } else {
          setError("Nenhum dado encontrado no caminho especificado.");
          setData([]);
          setHeaders([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firebase error:', error);
        setError('Falha ao carregar dados do Firebase.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Carregando dados do Firebase...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  const getColumnValue = (item: any, header: string) => {
    const value = item[header];

    if (header === 'Status') {
        const statusText = String(value ?? 'N/A');
        return <Badge variant={getStatusVariant(statusText)}>{statusText}</Badge>;
    }

    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value ?? '-');
  };

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>JobTracker – Dados de Produção</CardTitle>
                <CardDescription>
                    Visualização dos dados em tempo real. Atualizado em: {new Date().toLocaleString('pt-BR')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        {headers.map((header) => (
                        <TableHead 
                            key={header}
                             className={cn(
                                NUMERIC_COLUMNS.includes(header) && "text-center"
                             )}
                        >
                            {header}
                        </TableHead>
                        ))}
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id} className="even:bg-muted/50">
                        {headers.map((header) => (
                            <TableCell 
                                key={`${item.id}-${header}`} 
                                className={cn(
                                    "py-2 px-4",
                                    NUMERIC_COLUMNS.includes(header) && "text-center font-mono",
                                    (header === 'Site' || header === 'Nome da peça') && "font-bold"
                                )}
                            >
                                {getColumnValue(item, header)}
                            </TableCell>
                        ))}
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
