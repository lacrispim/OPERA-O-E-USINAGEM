
'use client';

import { PageHeader } from "@/components/page-header";
import { FirebaseRecordsTable } from "./components/firebase-records-table";
import { getFirebaseProductionRecords } from "@/lib/firebase-data";
import { useDatabase } from "@/firebase";
import type { ProductionRecord } from "@/lib/types";
import { useEffect, useState } from "react";

const PREFERRED_COLUMN_ORDER: (keyof ProductionRecord)[] = [
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
    "manufacturingTime",
];

const getHeaders = (data: ProductionRecord[]): (keyof ProductionRecord)[] => {
  if (data.length === 0) return PREFERRED_COLUMN_ORDER;
  const allHeaders = new Set<keyof ProductionRecord>();
    data.forEach(item => {
        (Object.keys(item) as (keyof ProductionRecord)[]).forEach(key => {
            if(key !== 'id' && key !== 'Observação') {
              allHeaders.add(key);
            }
        })
    });

  const sortedHeaders = PREFERRED_COLUMN_ORDER.filter(h => allHeaders.has(h));
  const remainingHeaders = Array.from(allHeaders).filter(h => !PREFERRED_COLUMN_ORDER.includes(h));
  return [...sortedHeaders, ...remainingHeaders];
};

export default function RegistrosFirebasePage() {
  const database = useDatabase();
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [headers, setHeaders] = useState<(keyof ProductionRecord)[]>(PREFERRED_COLUMN_ORDER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!database) return;
      setLoading(true);
      const fetchedRecords = await getFirebaseProductionRecords(database);
      setRecords(fetchedRecords);
      setHeaders(getHeaders(fetchedRecords));
      setLoading(false);
    }
    fetchData();
  }, [database]);


  if (loading) {
      return (
          <>
            <PageHeader
                title="Visualização de Dados"
                description="Visualize os dados da planilha em tempo real com filtros avançados."
            />
            <main className="px-4 sm:px-6 lg:px-8 pb-8">
                <p>Carregando dados...</p>
            </main>
          </>
      )
  }

  return (
    <>
      <PageHeader
        title="Visualização de Dados"
        description="Visualize os dados da planilha em tempo real com filtros avançados."
      />
      <main className="px-4 sm:px-6 lg:px-8 pb-8">
        <FirebaseRecordsTable initialData={records} initialHeaders={headers} />
      </main>
    </>
  );
}
