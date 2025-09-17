
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
import { MultiSelect } from '@/components/ui/multi-select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


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

const STANDARDIZED_STATUS = {
    EM_PRODUCAO: 'Em Produção',
    FILA_PRODUCAO: 'Fila de Produção',
    ENCERRADO: 'Encerrado',
    TBD: 'TBD',
    DECLINADO: 'Declinado',
    TRATAMENTO: 'Tratamento',
    OUTRO: 'Outro',
};

const standardizeStatus = (status: string): string => {
    if (!status) return STANDARDIZED_STATUS.OUTRO;
    const s = status.toLowerCase().trim();
    if (s.includes('em produçao') || s.includes('em produção')) return STANDARDIZED_STATUS.EM_PRODUCAO;
    if (s.includes('fila de produçao') || s.includes('fila de produção')) return STANDARDIZED_STATUS.FILA_PRODUCAO;
    if (s.includes('concluido') || s.includes('concluído') || s.includes('encerrada') || s.includes('encerrado')) return STANDARDIZED_STATUS.ENCERRADO;
    if (s.includes('tbd')) return STANDARDIZED_STATUS.TBD;
    if (s.includes('declinado')) return STANDARDIZED_STATUS.DECLINADO;
    if (s.includes('tratamento')) return STANDARDIZED_STATUS.TRATAMENTO;
    if (s.includes('pendente') || s.includes('andamento')) return STANDARDIZED_STATUS.FILA_PRODUCAO;
    return s; // Keep original-like if no match, but capitalized
};


const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "in-progress" | "warning" | "error" => {
    const s = status ? status.toLowerCase() : '';
    if (s.includes('encerrado')) return 'default';
    if (s === 'em produção') return 'in-progress';
    if (s === 'fila de produção') return 'secondary';
    if (s.includes('tratamento')) return 'warning';
    if (s.includes('declinado')) return 'error';
    if (s.includes('tbd')) return 'outline';
    return 'outline';
}

const factoryColors: Record<string, string> = {
    "Igarassu": "bg-sky-200 text-sky-800",
    "Vinhedo": "bg-amber-200 text-amber-800",
    "Suape": "bg-violet-200 text-violet-800",
    "Aguaí": "bg-emerald-200 text-emerald-800",
    "Garanhuns": "bg-rose-200 text-rose-800",
    "Indaiatuba": "bg-lime-200 text-lime-800",
    "Valinhos": "bg-cyan-200 text-cyan-800",
    "Pouso Alegre": "bg-fuchsia-200 text-fuchsia-800",
    "default": "bg-gray-200 text-gray-800"
};

const getFactoryColor = (factory: string) => {
    return factoryColors[factory] || factoryColors.default;
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

const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i),
    label: format(new Date(0, i), "MMMM", { locale: ptBR }),
  }));


export function FirebaseRecordsTable() {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [siteFilter, setSiteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  
  useEffect(() => {
    const nodePath = '12dXywY4L-NXhuKxJe9TuXBo-C4dtvcaWlPm6LdHeP5U/Página1';
    const nodeRef = ref(database, nodePath);

    const unsubscribe = onValue(
      nodeRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const rawData = snapshot.val();
          const dataArray = Object.keys(rawData).map((key) => {
            const item = rawData[key];
            return {
              id: key,
              ...item,
              Status: standardizeStatus(item.Status), // Standardize status on data load
            };
          });

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
  
  const uniqueSites = useMemo(() => ['all', ...Array.from(new Set(data.map(d => d.Site).filter(Boolean)))], [data]);
  
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(data.map(d => d.Status).filter(Boolean));
    return Array.from(statuses).map(s => ({label: s, value: s}));
  }, [data]);


  const filteredData = useMemo(() => {
    return data.filter(item => {
        const matchesSite = siteFilter === 'all' || item.Site === siteFilter;
        const matchesStatus = statusFilter.length === 0 || statusFilter.includes(item.Status);

        const term = searchTerm.toLowerCase();
        const matchesSearch = !term ||
            String(item['Nome da peça'] || '').toLowerCase().includes(term) ||
            String(item.Material || '').toLowerCase().includes(term);
        
        const matchesMonth = monthFilter === 'all' || (item.Data && new Date(item.Data.split('/').reverse().join('-')).getMonth() === parseInt(monthFilter));

        return matchesSite && matchesStatus && matchesSearch && matchesMonth;
    });
  }, [data, siteFilter, statusFilter, searchTerm, monthFilter]);

  const clearFilters = () => {
    setSiteFilter('all');
    setStatusFilter([]);
    setSearchTerm('');
    setMonthFilter('all');
  };

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

    if (header === 'Site') {
        const siteText = String(value ?? 'N/A');
        return <Badge className={cn("border-transparent hover:opacity-80", getFactoryColor(siteText))}>{siteText}</Badge>;
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
                    <div className="flex flex-col md:flex-row flex-wrap items-center gap-4 pt-4">
                         <div className="relative w-full md:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                            placeholder="Buscar por peça ou material..."
                            value={searchTerm}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className="pl-10"
                            />
                        </div>
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
                        <Select value={monthFilter} onValueChange={setMonthFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filtrar por Mês" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Meses</SelectItem>
                                {months.map(month => (
                                    <SelectItem key={month.value} value={String(month.value)}>{month.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <MultiSelect
                            options={uniqueStatuses}
                            onValueChange={setStatusFilter}
                            defaultValue={statusFilter}
                            placeholder="Filtrar por Status"
                            className="w-full md:w-[220px]"
                        />
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
                                            (header === 'Nome da peça') && "font-bold"
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
