'use client';

import { PageHeader } from "@/components/page-header";
import { FirebaseRecordsTable } from "./components/firebase-records-table";
import { FirebaseLossesTable } from "./components/firebase-losses-table";
import { useDatabase } from "@/firebase";
import type { OperatorProductionInput, ProductionLossInput } from "@/lib/types";
import { useEffect, useState } from "react";
import { ref, onValue, query, orderByChild } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";


export default function RegistrosFirebasePage() {
  const database = useDatabase();
  const { toast } = useToast();
  const [productionRecords, setProductionRecords] = useState<OperatorProductionInput[]>([]);
  const [lossRecords, setLossRecords] = useState<ProductionLossInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!database) return;
    
    setLoading(true);
    setError(null);

    let activeListeners = 2;

    const handleInitialLoad = () => {
        activeListeners--;
        if (activeListeners === 0) {
            setLoading(false);
        }
    };
    
    const handleError = (err: any, type: string) => {
        console.error(`Error fetching ${type}:`, err);
        setError(`Failed to load ${type}. Ensure you have the correct permissions.`);
        setLoading(false); // Stop loading on error
        toast({
            variant: "destructive",
            title: `Erro ao carregar dados de ${type}`,
            description: err.message || `Não foi possível buscar os registros de ${type}.`
        })
    };

    // --- Listener for production entries ---
    const productionRef = ref(database, 'production-entries');
    const productionQuery = query(productionRef, orderByChild('timestamp'));
    const productionUnsubscribe = onValue(productionQuery, 
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const records = Object.keys(data).map(key => ({ id: key, ...data[key] })).sort((a,b) => b.timestamp - a.timestamp);
            setProductionRecords(records);
        } else {
            setProductionRecords([]);
        }
        if (activeListeners > 0) handleInitialLoad();
      }, 
      (err) => handleError(err, "produção")
    );

    // --- Listener for production losses ---
    const lossesRef = ref(database, 'production-losses');
    const lossesQuery = query(lossesRef, orderByChild('timestamp'));
    const lossesUnsubscribe = onValue(lossesQuery, 
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const records = Object.keys(data).map(key => ({ id: key, ...data[key] })).sort((a,b) => b.timestamp - a.timestamp);
            setLossRecords(records);
        } else {
            setLossRecords([]);
        }
        if (activeListeners > 0) handleInitialLoad();
      }, 
      (err) => handleError(err, "perdas")
    );

    // Cleanup function to detach listeners on component unmount
    return () => {
      productionUnsubscribe();
      lossesUnsubscribe();
    };
  }, [database, toast]);


  if (loading) {
      return (
          <>
            <PageHeader
                title="Dados de Produção e Perdas"
                description="Visualize todos os dados de produção e perdas em tempo real com filtros avançados."
            />
            <main className="px-4 sm:px-6 lg:px-8 pb-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center h-96">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="mt-4 text-muted-foreground">Carregando dados do Realtime Database...</p>
                        </div>
                    </CardContent>
                </Card>
            </main>
          </>
      )
  }

  if (error) {
      return (
          <>
            <PageHeader
                title="Dados de Produção e Perdas"
                description="Visualize todos os dados de produção e perdas em tempo real com filtros avançados."
            />
            <main className="px-4 sm:px-6 lg:px-8 pb-8">
                <Card>
                    <CardContent className="pt-6">
                         <div className="flex flex-col items-center justify-center h-96 bg-destructive/10 rounded-lg">
                            <p className="text-destructive font-medium">{error}</p>
                         </div>
                     </CardContent>
                </Card>
            </main>
          </>
      )
  }


  return (
    <>
      <PageHeader
        title="Dados de Produção e Perdas"
        description="Visualize todos os dados de produção e perdas em tempo real com filtros avançados."
      />
      <main className="px-4 sm:px-6 lg:px-8 pb-8 space-y-8">
        <FirebaseRecordsTable initialData={productionRecords} />
        <FirebaseLossesTable initialData={lossRecords} />
      </main>
    </>
  );
}
