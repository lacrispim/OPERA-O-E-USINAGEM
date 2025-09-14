
'use client';

import { useEffect, useState, useMemo, ChangeEvent } from 'react';
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
import { Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
const TRUNCATE_COLUMNS = ["Nome da peça", "Material", "Observação"];
const TRUNCATE_LENGTH = 25;

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const s = status ? status.toLowerCase() : '';
    if (s.includes('concluído')) return 'default';
    if (s.includes('produção') || s.includes('andamento')) return 'secondary';
    if (s.includes('pendente')) return 'destructive';
    return 'outline';
}

const TruncatedCell = ({ text }: { text: string }) => {
    if (!text || text.length <= TRUNCATE_LENGTH) {
        return <>{text || '-'}</>;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="cursor-default">{text.substring(0, TRUNCATE_LENGTH)}...</span>
            </TooltipTrigger>
            <TooltipContent>
                <p>{text}</p>
            </TooltipContent>
        </Tooltip>
    );
};


export function FirebaseRecordsTable() {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [siteFilter, setSiteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

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

  const uniqueSites = useMemo(() => ['all', ...new Set(data.map(d => d.Site).filter(Boolean))], [data]);
  const uniqueStatuses = useMemo(() => ['all', ...new Set(data.map(d => d.Status).filter(Boolean))], [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
        const matchesSite = siteFilter === 'all' || item.Site === siteFilter;
        const matchesStatus = statusFilter === 'all' || item.Status === statusFilter;
        const matchesDate = !dateFilter || (item.Data && item.Data.includes(dateFilter));
        return matchesSite && matchesStatus && matchesDate;
    });
  }, [data, siteFilter, statusFilter, dateFilter]);

  const clearFilters = () => {
    setSiteFilter('all');
    setStatusFilter('all');
    setDateFilter('');
  }

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
    const stringValue = String(value ?? '-');

    if (header === 'Status') {
        const statusText = String(value ?? 'N/A');
        return <Badge variant={getStatusVariant(statusText)}>{statusText}</Badge>;
    }
    
    if (TRUNCATE_COLUMNS.includes(header)) {
        return <TruncatedCell text={stringValue} />;
    }

    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return stringValue;
  };

  return (
    <TooltipProvider>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>JobTracker – Dados de Produção</CardTitle>
                    <CardDescription>
                        Visualização dos dados em tempo real. Atualizado em: {new Date().toLocaleString('pt-BR')}
                    </CardDescription>
                    <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
                        <Select value={siteFilter} onValueChange={setSiteFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filtrar por Site" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueSites.map(site => (
                                <SelectItem key={site} value={site}>
                                    {site === 'all' ? 'Todos os Sites' : site}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filtrar por Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueStatuses.map(status => (
                                <SelectItem key={status} value={status}>
                                    {status === 'all' ? 'Todos os Status' : status}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="relative w-full md:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                            placeholder="Filtrar por Data (DD/MM/YYYY)..."
                            value={dateFilter}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setDateFilter(e.target.value)}
                            className="pl-10"
                            />
                        </div>
                        <Button variant="outline" onClick={clearFilters}>Limpar Filtros</Button>
                    </div>
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
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
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
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={headers.length} className="h-24 text-center">
                                    Nenhum resultado encontrado com os filtros aplicados.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    </TooltipProvider>
  );
}
