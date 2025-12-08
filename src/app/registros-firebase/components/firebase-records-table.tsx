
'use client';

import { useState, useMemo } from 'react';
import type { OperatorProductionInput, ProductionStatus } from '@/lib/types';
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
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';

const TRUNCATE_COLUMNS = ["Nº Forms"];
const TRUNCATE_LENGTH = 25;

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "in-progress" | "warning" | "error" => {
    const s = status ? status.toLowerCase() : '';
    if (s.includes('encerrado')) return 'default';
    if (s === 'em produção') return 'in-progress';
    if (s === 'fila de produção') return 'secondary';
    if (s.includes('tratamento')) return 'warning';
    if (s.includes('rejeitado')) return 'error';
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

const PREFERRED_COLUMN_ORDER: (keyof OperatorProductionInput)[] = [
    "operatorId",
    "factory",
    "machineId",
    "formsNumber",
    "quantityProduced",
    "productionTimeSeconds",
    "status",
    "timestamp",
];

const COLUMN_HEADERS: Record<string, string> = {
    operatorId: "Operador",
    factory: "Fábrica",
    machineId: "Máquina",
    formsNumber: "Nº Forms",
    quantityProduced: "Produzido",
    productionTimeSeconds: "Tempo de Usinagem",
    status: "Status",
    timestamp: "Data e Horário",
    operationCount: "Nº Operações",
};

const NUMERIC_COLUMNS = ["quantityProduced", "productionTimeSeconds", "operationCount"];

interface FirebaseRecordsTableProps {
  initialData: OperatorProductionInput[];
}

export function FirebaseRecordsTable({ initialData }: FirebaseRecordsTableProps) {
  const [data] = useState<OperatorProductionInput[]>(initialData);
  const headers = useMemo(() => {
    if (data.length === 0) return PREFERRED_COLUMN_ORDER;
    const allHeaders = new Set<keyof OperatorProductionInput>();
      data.forEach(item => {
          (Object.keys(item) as (keyof OperatorProductionInput)[]).forEach(key => {
              if(key !== 'id') {
                allHeaders.add(key);
              }
          })
      });
  
    const sortedHeaders = PREFERRED_COLUMN_ORDER.filter(h => allHeaders.has(h));
    const remainingHeaders = Array.from(allHeaders).filter(h => !PREFERRED_COLUMN_ORDER.includes(h));
    return [...sortedHeaders, ...remainingHeaders];
  }, [data]);
  
  // Filter states
  const [factoryFilter, setFactoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [monthFilter, setMonthFilter] = useState('all');
  const [operatorIdFilter, setOperatorIdFilter] = useState('');
  const [machineIdFilter, setMachineIdFilter] = useState('');
  
  const uniqueFactories = useMemo(() => ['all', ...Array.from(new Set(data.map(d => d.factory).filter(Boolean)))], [data]);
  
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(data.map(d => d.status).filter(Boolean));
    return Array.from(statuses).map(s => ({label: s, value: s}));
  }, [data]);


  const filteredData = useMemo(() => {
    return data.filter(item => {
        const matchesFactory = factoryFilter === 'all' || item.factory === factoryFilter;
        const matchesStatus = statusFilter.length === 0 || statusFilter.includes(item.status);
        
        let itemDate: Date | null = null;
        if (item.timestamp) {
            if (item.timestamp instanceof Timestamp) {
                itemDate = item.timestamp.toDate();
            } else if (typeof item.timestamp === 'string') {
                itemDate = new Date(item.timestamp);
            }
        }

        const matchesMonth = monthFilter === 'all' || (itemDate && itemDate.getMonth() === parseInt(monthFilter));

        const matchesOperator = !operatorIdFilter || String(item.operatorId).toLowerCase().includes(operatorIdFilter.toLowerCase());
        const matchesMachine = !machineIdFilter || String(item.machineId).toLowerCase().includes(machineIdFilter.toLowerCase());

        return matchesFactory && matchesStatus && matchesMonth && matchesOperator && matchesMachine;
    });
  }, [data, factoryFilter, statusFilter, monthFilter, operatorIdFilter, machineIdFilter]);

  const clearFilters = () => {
    setFactoryFilter('all');
    setStatusFilter([]);
    setMonthFilter('all');
    setOperatorIdFilter('');
    setMachineIdFilter('');
  };

  const getColumnValue = (item: OperatorProductionInput, header: keyof OperatorProductionInput) => {
    const value = item[header];

    if (header === 'timestamp') {
        if (!value) return 'N/A';
        const date = value instanceof Timestamp ? value.toDate() : new Date(value as string);
        return format(date, 'dd/MM/yyyy HH:mm');
    }

    const stringValue = String(value ?? '-');

    if (header === 'status') {
        return <Badge variant={getStatusVariant(stringValue as ProductionStatus)}>{stringValue}</Badge>;
    }
    
    if (header === 'factory') {
        return <Badge className={cn("border-transparent hover:opacity-80", getFactoryColor(stringValue))}>{stringValue}</Badge>;
    }
    
    if (TRUNCATE_COLUMNS.includes(COLUMN_HEADERS[header])) {
        return <TruncatedCell text={stringValue} />;
    }

    if (header === 'productionTimeSeconds') {
        const totalSeconds = Number(value);
        if (isNaN(totalSeconds)) return '-';
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    
    if (NUMERIC_COLUMNS.includes(header)) {
        const num = Number(value);
        return isNaN(num) ? '-' : num;
    }

    if (typeof value === 'object' && value !== null && !(value instanceof Timestamp)) {
      return JSON.stringify(value);
    }
    return stringValue;
  };
  
  const handleExport = () => {
    const dataToExport = filteredData.map(item => {
        const row: Record<string, any> = {};
        headers.forEach(header => {
            const headerText = COLUMN_HEADERS[header] || String(header);
            const value = item[header];
             if (header === 'timestamp') {
                const date = value instanceof Timestamp ? value.toDate() : new Date(value as string);
                row[headerText] = format(date, 'dd/MM/yyyy HH:mm');
            } else if (header === 'productionTimeSeconds') {
                const totalSeconds = Number(value);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const secs = totalSeconds % 60;
                row[headerText] = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            } else {
                 row[headerText] = item[header as keyof OperatorProductionInput] ?? '-';
            }
        });
        return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados de Produção");

    // Auto-size columns
    const max_width = dataToExport.reduce((w, r) => Math.max(w, ...Object.values(r).map(val => String(val).length)), 10);
    worksheet["!cols"] = headers.map(() => ({ wch: max_width + 2 }));

    XLSX.writeFile(workbook, "DadosDeProducao.xlsx");
};


  return (
    <TooltipProvider>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className='flex justify-between items-start'>
                        <div>
                            <CardTitle>Dados de Produção</CardTitle>
                            <CardDescription>
                                Visualização dos dados de produção salvos no Firestore. Atualizado em: {new Date().toLocaleString('pt-BR')}
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={handleExport}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Exportar para Excel
                        </Button>
                    </div>
                    <div className="flex flex-col gap-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Input
                                placeholder="Filtrar por Operador..."
                                value={operatorIdFilter}
                                onChange={(e) => setOperatorIdFilter(e.target.value)}
                            />
                            <Input
                                placeholder="Filtrar por Máquina..."
                                value={machineIdFilter}
                                onChange={(e) => setMachineIdFilter(e.target.value)}
                            />
                             <Select value={factoryFilter} onValueChange={setFactoryFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por Fábrica" />
                                </SelectTrigger>
                                <SelectContent>
                                    {uniqueFactories.map(site => (
                                    <SelectItem key={site} value={site}>
                                        {site === 'all' ? 'Todas as Fábricas' : site}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                           <MultiSelect
                                options={uniqueStatuses}
                                onValueChange={setStatusFilter}
                                defaultValue={statusFilter}
                                placeholder="Filtrar por Status"
                                className="w-full"
                            />
                            <div className="lg:col-span-3 flex justify-end">
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
