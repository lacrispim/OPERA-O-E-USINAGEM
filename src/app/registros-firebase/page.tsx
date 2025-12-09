
'use client';

import { PageHeader } from "@/components/page-header";
import { FirebaseRecordsTable } from "./components/firebase-records-table";
import { FirebaseLossesTable } from "./components/firebase-losses-table";
import { useFirestore } from "@/firebase";
import type { OperatorProductionInput, ProductionLossInput } from "@/lib/types";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";


export default function RegistrosFirebasePage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [productionRecords, setProductionRecords] = useState<OperatorProductionInput[]>([]);
  const [lossRecords, setLossRecords] = useState<ProductionLossInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore) {
      // Firestore might not be available on first render, wait for it.
      return;
    }
    
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
        const permissionError = new FirestorePermissionError({ path: `Query for ${type}`, operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
        console.error(`Error fetching ${type}:`, err);
        setError(`Failed to load ${type}. Ensure you have the correct permissions.`);
        setLoading(false); // Stop loading on error
    };

    // --- Listener for production entries ---
    const productionQuery = query(collection(firestore, 'production-entries'), orderBy('timestamp', 'desc'));
    const productionUnsubscribe = onSnapshot(productionQuery, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OperatorProductionInput));
        setProductionRecords(data);
        if (activeListeners > 0) handleInitialLoad();
      }, 
      (serverError) => {
        handleError(serverError, "production entries");
        toast({
            variant: "destructive",
            title: "Erro ao carregar dados de produção",
            description: serverError.message || "Não foi possível buscar os registros do Firestore."
        })
      }
    );

    // --- Listener for production losses ---
    const lossesQuery = query(collection(firestore, 'production-losses'), orderBy('timestamp', 'desc'));
    const lossesUnsubscribe = onSnapshot(lossesQuery, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionLossInput));
        setLossRecords(data);
        if (activeListeners > 0) handleInitialLoad();
      }, 
      (serverError) => {
        handleError(serverError, "production losses");
        toast({
            variant: "destructive",
            title: "Erro ao carregar dados de perdas",
            description: serverError.message || "Não foi possível buscar os registros de perdas."
        })
      }
    );

    // Cleanup function to detach listeners on component unmount
    return () => {
      productionUnsubscribe();
      lossesUnsubscribe();
    };
  }, [firestore, toast]);


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
                            <p className="mt-4 text-muted-foreground">Carregando dados do Firestore...</p>
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
