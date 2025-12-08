
'use client';

import { PageHeader } from "@/components/page-header";
import { FirebaseRecordsTable } from "./components/firebase-records-table";
import { mapFirebaseToProductionRecord } from "@/lib/firebase-data";
import { useDatabase } from "@/firebase";
import type { ProductionRecord } from "@/lib/types";
import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!database) {
        // The database instance might not be available on first render.
        // The hook will re-run once it's available.
        return;
      }
      
      setLoading(true);
      setError(null);

      try {
        const nodePath = '12dXywY4L-NXhuKxJe9TuXBo-C4dtvcaWlPm6LdHeP5U/Página1';
        const nodeRef = ref(database, nodePath);
        const snapshot = await get(nodeRef);

        let fetchedRecords: ProductionRecord[] = [];
        if (snapshot.exists()) {
          const rawData = snapshot.val();
          const dataArray = Object.keys(rawData).map((key) => ({
            id: key,
            ...rawData[key],
          }));
          fetchedRecords = mapFirebaseToProductionRecord(dataArray);
        }
        
        setRecords(fetchedRecords);
        setHeaders(getHeaders(fetchedRecords));

      } catch (err) {
        console.error("Firebase data fetching error:", err);
        setError("Falha ao carregar os dados do banco de dados.");
      } finally {
        setLoading(false);
      }
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
                <p>Carregando dados do Firebase...</p>
            </main>
          </>
      )
  }

  if (error) {
      return (
          <>
            <PageHeader
                title="Visualização de Dados"
                description="Visualize os dados da planilha em tempo real com filtros avançados."
            />
            <main className="px-4 sm:px-6 lg:px-8 pb-8">
                <p className="text-destructive">{error}</p>
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
