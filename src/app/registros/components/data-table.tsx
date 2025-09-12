'use client';

import { useState, useMemo, ChangeEvent } from "react";
import { ProductionRecord } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Search, ArrowUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SortKey = keyof ProductionRecord;
type SortDirection = 'asc' | 'desc';

export function DataTable({ data }: { data: ProductionRecord[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);

  const uniqueMaterials = useMemo(() => ['all', ...new Set(data.map(d => d.material))], [data]);

  const filteredAndSortedData = useMemo(() => {
    let filteredData = data.filter(item => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        item.partName.toLowerCase().includes(term) ||
        item.requestingFactory.toLowerCase().includes(term);

      const matchesMaterial =
        materialFilter === 'all' || item.material === materialFilter;

      return matchesSearch && matchesMaterial;
    });

    if (sortConfig !== null) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [data, searchTerm, materialFilter, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const handleExport = () => {
    const headers = ['ID', 'Data', 'Fábrica Solicitante', 'Nome da Peça', 'Material', 'Tempo de Fabricação (h)'];
    const csvRows = [
      headers.join(','),
      ...filteredAndSortedData.map(row => 
        [
          row.id,
          new Date(row.date).toLocaleString('pt-BR'),
          `"${row.requestingFactory}"`,
          `"${row.partName}"`,
          `"${row.material}"`,
          row.manufacturingTime
        ].join(',')
      )
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'registros_producao.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por peça ou fábrica..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex w-full md:w-auto items-center gap-4">
            <Select value={materialFilter} onValueChange={setMaterialFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por material" />
              </SelectTrigger>
              <SelectContent>
                {uniqueMaterials.map(material => (
                  <SelectItem key={material} value={material}>
                    {material === 'all' ? 'Todos os materiais' : material}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Exportar
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('partName')}>
                    Peça <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('material')}>
                    Material <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('requestingFactory')}>
                    Fábrica <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('date')}>
                    Data <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => requestSort('manufacturingTime')}>
                    Tempo (h) <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.partName}</TableCell>
                  <TableCell><Badge variant="secondary">{item.material}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{item.requestingFactory}</TableCell>
                  <TableCell>{new Date(item.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right font-mono">{item.manufacturingTime.toFixed(1)}</TableCell>
                </TableRow>
              ))}
              {filteredAndSortedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum resultado encontrado.
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
