'use client';

import { useEffect, useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { FirebaseProductionRecord } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ProductionLineTable() {
  const [data, setData] = useState<FirebaseProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dbRef = ref(database, 'Página 1');
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const rawData = snapshot.val();
          // Firebase returns an array-like object, convert it to a proper array
           const dataArray = Object.keys(rawData)
            .map(key => ({'#': key, ...rawData[key]}))
            .filter(item => item['#'] && item.Data); // Filter out invalid entries
          setData(dataArray);
        } else {
          setData([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firebase error:', error);
        setError('Falha ao carregar dados do Firebase.');
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          Carregando dados da linha de produção...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Requisição</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Nome da peça</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead className="text-right">Centro (min)</TableHead>
                <TableHead className="text-right">Torno (min)</TableHead>
                <TableHead className="text-right">Programação (min)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item['#']}>
                  <TableCell>
                     <Badge variant={
                         item.Status === 'Encerrada' ? 'destructive' 
                         : item.Status === 'Fila de produção' ? 'default'
                         : 'secondary'
                     }>
                        {item.Site}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.Data}</TableCell>
                  <TableCell>{item.Requisição}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.Material}</TableCell>
                  <TableCell className="max-w-xs truncate">{item['Nome da peça']}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.Status}</Badge>
                  </TableCell>
                  <TableCell>{item.Quantidade}</TableCell>
                  <TableCell className="text-right font-mono">{item.Centro || '-'}</TableCell>
                  <TableCell className="text-right font-mono">{item['Torno (minutos)'] || '-'}</TableCell>
                  <TableCell className="text-right font-mono">{item['Programação (minutos)'] || '-'}</TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    Nenhum dado encontrado no nó 'Página 1'.
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
