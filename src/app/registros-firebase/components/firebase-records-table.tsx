'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { Loader2, Factory } from 'lucide-react';

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

  const totalCentroMinutos = useMemo(() => {
    return data.reduce((acc, item) => {
        const minutos = parseFloat(item['Centro (minutos)']);
        return isNaN(minutos) ? acc : acc + minutos;
    }, 0);
  }, [data]);

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
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value ?? '-');
  };

  return (
    <div className="space-y-8">
        <Card className="max-w-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Centro (minutos)</CardTitle>
                <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalCentroMinutos.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-muted-foreground">Soma total dos minutos registrados</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Dados "JobTracker"</CardTitle>
                <CardDescription>
                    Visualização dos dados em tempo real do nó especificado.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        {headers.map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                        ))}
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id}>
                        {headers.map((header) => (
                            <TableCell key={`${item.id}-${header}`} className="py-2 px-4">
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
