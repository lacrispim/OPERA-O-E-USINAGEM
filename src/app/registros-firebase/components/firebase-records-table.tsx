
'use client';

import { useState, useMemo } from 'react';
import type { ProductionRecord } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MultiSelect } from '@/components/ui/multi-select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TRUNCATE_COLUMNS = ["Nome da peça", "Material", "Observação", "Site"];
const TRUNCATE_LENGTH = 25;

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

const PREFERRED_COLUMN_ORDER = [
    "requestId",
    "requestingFactory",
    "date",
    "material",
    "partName",
    "status",
    "quantity",
    "centroTime",
    "tornoTime",
    "programacaoTime",
    "Observação" 
];

const COLUMN_HEADERS: Record<keyof ProductionRecord, string> = {
    id: "ID",
    requestId: "Requisição",
    requestingFactory: "Site",
    date: "Data",
    material: "Material",
    partName: "Nome da peça",
    status: "Status",
    quantity: "Quantidade",
    centroTime: "Centro (h)",
    tornoTime: "Torno (h)",
    programacaoTime: "Programação (h)",
    manufacturingTime: "Tempo Total (h)",
    Observação: "Observação"
};

const NUMERIC_COLUMNS = ["quantity", "requestId", "centroTime", "tornoTime", "programacaoTime", "manufacturingTime"];

interface FirebaseRecordsTableProps {
  initialData: ProductionRecord[];
  initialHeaders: (keyof ProductionRecord)[];
}

export function FirebaseRecordsTable({ initialData, initialHeaders }: FirebaseRecordsTableProps) {
  const [data] = useState<ProductionRecord[]>(initialData);
  const [headers] = useState<(keyof ProductionRecord)[]>(initialHeaders);
  
  // Filter states
  const [siteFilter, setSiteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [monthFilter, setMonthFilter] = useState('all');
  const [reqFilter, setReqFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [partNameFilter, setPartNameFilter] = useState('');
  
  const uniqueSites = useMemo(() => ['all', ...Array.from(new Set(data.map(d => d.requestingFactory).filter(Boolean)))], [data]);
  
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(data.map(d => d.status).filter(Boolean));
    return Array.from(statuses).map(s => ({label: s, value: s}));
  }, [data]);


  const filteredData = useMemo(() => {
    return data.filter(item => {
        const matchesSite = siteFilter === 'all' || item.requestingFactory === siteFilter;
        const matchesStatus = statusFilter.length === 0 || statusFilter.includes(item.status);
        
        const itemDate = new Date(item.date);
        const matchesMonth = monthFilter === 'all' || (itemDate && itemDate.getMonth() === parseInt(monthFilter));

        const matchesReq = !reqFilter || (item.requestId && String(item.requestId).toLowerCase().includes(reqFilter.toLowerCase()));
        const matchesMaterial = !materialFilter || String(item.material).toLowerCase().includes(materialFilter.toLowerCase());
        const matchesPartName = !partNameFilter || String(item.partName).toLowerCase().includes(partNameFilter.toLowerCase());

        return matchesSite && matchesStatus && matchesMonth && matchesReq && matchesMaterial && matchesPartName;
    });
  }, [data, siteFilter, statusFilter, monthFilter, reqFilter, materialFilter, partNameFilter]);

  const clearFilters = () => {
    setSiteFilter('all');
    setStatusFilter([]);
    setMonthFilter('all');
    setReqFilter('');
    setMaterialFilter('');
    setPartNameFilter('');
  };

  const getColumnValue = (item: ProductionRecord, header: keyof ProductionRecord) => {
    const value = item[header];

    if (header === 'date') {
        return format(new Date(value as string), 'dd/MM/yyyy');
    }

    const stringValue = String(value ?? '-');

    if (header === 'status') {
        return <Badge variant={getStatusVariant(stringValue)}>{stringValue}</Badge>;
    }
    
    if (header === 'requestingFactory') {
        return <Badge className={cn("border-transparent hover:opacity-80", getFactoryColor(stringValue))}>{stringValue}</Badge>;
    }
    
    if (TRUNCATE_COLUMNS.includes(COLUMN_HEADERS[header])) {
        return <TruncatedCell text={stringValue} />;
    }
    
    if (NUMERIC_COLUMNS.includes(header)) {
        const num = Number(value);
        if (header.includes('Time')) { // Format hours
            return isNaN(num) ? '-' : num.toFixed(2);
        }
        return isNaN(num) ? '-' : num;
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
                        Visualização dos dados carregados do servidor. Atualizado em: {new Date().toLocaleString('pt-BR')}
                    </CardDescription>
                    <div className="flex flex-col gap-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Input
                                placeholder="Filtrar por Requisição..."
                                value={reqFilter}
                                onChange={(e) => setReqFilter(e.target.value)}
                            />
                            <Input
                                placeholder="Filtrar por Nome da peça..."
                                value={partNameFilter}
                                onChange={(e) => setPartNameFilter(e.target.value)}
                            />
                            <Input
                                placeholder="Filtrar por Material..."
                                value={materialFilter}
                                onChange={(e) => setMaterialFilter(e.target.value)}
                            />
                            <Select value={siteFilter} onValueChange={setSiteFilter}>
                                <SelectTrigger>
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
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Select value={monthFilter} onValueChange={setMonthFilter}>
                                <SelectTrigger>
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
                                className="w-full"
                            />
                            <div className="lg:col-span-2 flex justify-end">
                                <Button variant="outline" onClick={clearFilters}>Limpar Filtros</Button>
                            </div>
                        </div>
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
                                {COLUMN_HEADERS[header] || String(header)}
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
                                            (header === 'partName') && "font-bold"
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
