
'use client';

import { useState, useMemo } from 'react';
import type { ProductionRecord } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format, getYear, getMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlannedPiecesBarChart } from './planned-pieces-bar-chart';
import { TotalPiecesCard } from './total-pieces-card';
import { UniqueRequestsCard } from './unique-requests-card';
import { FactoryHoursBarChart } from './factory-hours-bar-chart';
import { TechnologyHoursBarChart } from './technology-hours-bar-chart';

const ALL_FACTORIES = [
  "Igarassu", "Vinhedo", "Suape", "Aguaí", "Garanhuns", "Indaiatuba", "Valinhos", "Pouso Alegre"
];

const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i),
    label: format(new Date(2000, i), "MMMM", { locale: ptBR }),
}));


type DashboardClientProps = {
  initialRecords: ProductionRecord[];
};

export function DashboardClient({ initialRecords }: DashboardClientProps) {
  const [factoryFilter, setFactoryFilter] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  const { uniqueFactories, uniqueYears } = useMemo(() => {
    const factorySet = new Set(ALL_FACTORIES);
    const yearSet = new Set<number>();

    initialRecords.forEach(record => {
      if (record.requestingFactory) {
        factorySet.add(record.requestingFactory);
      }
      if (record.date) {
        yearSet.add(getYear(new Date(record.date)));
      }
    });

    return {
      uniqueFactories: Array.from(factorySet).sort().map(f => ({ label: f, value: f })),
      uniqueYears: ['all', ...Array.from(yearSet).sort((a, b) => b - a)],
    };
  }, [initialRecords]);

  const filteredRecords = useMemo(() => {
    return initialRecords.filter(record => {
      const date = new Date(record.date);
      const matchesFactory = factoryFilter.length === 0 || factoryFilter.includes(record.requestingFactory);
      const matchesYear = yearFilter === 'all' || getYear(date) === Number(yearFilter);
      const matchesMonth = monthFilter === 'all' || getMonth(date) === Number(monthFilter);

      return matchesFactory && matchesYear && matchesMonth;
    });
  }, [initialRecords, factoryFilter, yearFilter, monthFilter]);
  

  const clearFilters = () => {
    setFactoryFilter([]);
    setYearFilter('all');
    setMonthFilter('all');
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-4 flex flex-col md:flex-row flex-wrap items-center gap-4">
                <div className="w-full md:w-auto md:min-w-[250px] lg:min-w-[300px]">
                    <MultiSelect
                        options={uniqueFactories}
                        onValueChange={setFactoryFilter}
                        defaultValue={factoryFilter}
                        placeholder="Filtrar por Fábrica"
                        className="w-full"
                    />
                </div>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-full md:w-[140px]">
                        <SelectValue placeholder="Filtrar por Ano" />
                    </SelectTrigger>
                    <SelectContent>
                        {uniqueYears.map(year => (
                        <SelectItem key={year} value={String(year)}>
                            {year === 'all' ? 'Todos os Anos' : year}
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
                            <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={clearFilters}>Limpar Filtros</Button>
            </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-4">
        <TotalPiecesCard records={filteredRecords} className="md:col-span-1" />
        <UniqueRequestsCard records={filteredRecords} className="md:col-span-1" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <PlannedPiecesBarChart records={filteredRecords} className="lg:col-span-1" />
        <FactoryHoursBarChart records={filteredRecords} className="lg:col-span-1" />
        <TechnologyHoursBarChart records={filteredRecords} className="lg:col-span-1" />
      </div>
    </div>
  );
}
