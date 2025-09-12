'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MultiSelect } from '@/components/ui/multi-select';

export function ProductionLineTable() {
  const [data, setData] = useState<FirebaseProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequisitions, setSelectedRequisitions] = useState<string[]>([]);

  useEffect(() => {
    const dbRef = ref(database, 'Página 1');
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const rawData = snapshot.val();
          const dataArray = Object.keys(rawData)
            .map(key => ({'#': key, ...rawData[key]}))
            .filter(item => item['#'] && item.Data);
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

    return () => unsubscribe();
  }, []);

  const requisitionOptions = useMemo(() => {
    const allRequisitions = data.map(item => item.Requisição?.toString()).filter(Boolean);
    const uniqueRequisitions = [...new Set(allRequisitions)];
    return uniqueRequisitions.map(req => ({ label: req, value: req }));
  }, [data]);

  const filteredData = useMemo(() => {
    if (selectedRequisitions.length === 0) {
      return data;
    }
    return data.filter(item => selectedRequisitions.includes(item.Requisição?.toString()));
  }, [data, selectedRequisitions]);

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
       <CardHeader>
        <CardTitle>Filtros</CardTitle>
         <div className="w-full md:w-1/3">
            <MultiSelect
                options={requisitionOptions}
                onValueChange={setSelectedRequisitions}
                defaultValue={selectedRequisitions}
                placeholder="Filtrar por Requisição..."
                className="w-full"
            />
        </div>
      </CardHeader>
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
              {filteredData.map((item) => (
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
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    Nenhum dado encontrado para os filtros selecionados.
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
