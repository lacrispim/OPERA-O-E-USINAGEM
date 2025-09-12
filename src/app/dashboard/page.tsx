'use client';

import { useEffect, useState, useMemo } from "react";
import { getFirebaseProductionRecords } from "@/lib/firebase-data";
import { PageHeader } from "@/components/page-header";
import { StatsCards } from "./components/stats-cards";
import { ProductionChart } from "./components/production-chart";
import { RegisterProductionSheet } from "./components/register-production-sheet";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { ProductionRecord } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, getMonth, getYear } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { SiteProductionChart } from "./components/site-production-chart";

const months = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: format(new Date(0, i), "MMMM", { locale: ptBR }),
}));

export default function DashboardPage() {
  const [allRecords, setAllRecords] = useState<ProductionRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState<string>(String(getMonth(new Date())));
  const [selectedYear, setSelectedYear] = useState<string>(String(getYear(new Date())));

  const availableYears = useMemo(() => {
    if (allRecords.length === 0) return [String(getYear(new Date()))];
    const years = new Set(allRecords.map(r => getYear(new Date(r.date))));
    return Array.from(years).sort((a, b) => b - a).map(String);
  }, [allRecords]);
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const records = await getFirebaseProductionRecords();
      setAllRecords(records);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = allRecords.filter(record => {
        const recordDate = new Date(record.date);
        const matchesYear = getYear(recordDate) === parseInt(selectedYear);
        const matchesMonth = getMonth(recordDate) === parseInt(selectedMonth);
        return matchesYear && matchesMonth;
    });
    setFilteredRecords(filtered);
  }, [allRecords, selectedMonth, selectedYear]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral das atividades de produção."
      >
        <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o Mês" />
                </SelectTrigger>
                <SelectContent>
                    {months.map(month => (
                        <SelectItem key={month.value} value={String(month.value)}>{month.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
             <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Selecione o Ano" />
                </SelectTrigger>
                <SelectContent>
                     {availableYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <RegisterProductionSheet>
                <Button>
                    <PlusCircle />
                    Registrar Produção
                </Button>
            </RegisterProductionSheet>
        </div>
      </PageHeader>
      <main className="px-4 sm:px-6 lg:px-8 space-y-8 pb-8">
        {loading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2">Carregando dados...</p>
            </div>
        ) : (
            <>
                <StatsCards records={filteredRecords} />
                <div className="grid gap-8 lg:grid-cols-2">
                  <ProductionChart records={filteredRecords} />
                  <SiteProductionChart records={filteredRecords} />
                </div>
            </>
        )}
      </main>
    </>
  );
}
