
'use client';

import { PageHeader } from "@/components/page-header";
import { FirebaseRecordsTable } from "./components/firebase-records-table";
import { useFirestore } from "@/firebase";
import type { OperatorProductionInput } from "@/lib/types";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


export default function RegistrosFirebasePage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [records, setRecords] = useState<OperatorProductionInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore) {
      // Firestore might not be available on first render.
      return;
    }
    
    setLoading(true);
    setError(null);

    const q = query(collection(firestore, 'production-entries'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OperatorProductionInput));
        setRecords(data);
        setLoading(false);
    }, (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: q.toString(),
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Firebase data fetching error:", serverError);
        setError("Falha ao carregar os dados do banco de dados.");
        toast({
            variant: "destructive",
            title: "Erro ao carregar dados",
            description: serverError.message || "Não foi possível buscar os registros do Firestore."
        })
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, toast]);


  if (loading) {
      return (
          <>
            <PageHeader
                title="Dados de Produção"
                description="Visualize os dados de produção em tempo real com filtros avançados."
            />
            <main className="px-4 sm:px-6 lg:px-8 pb-8">
                <p>Carregando dados do Firestore...</p>
            </main>
          </>
      )
  }

  if (error) {
      return (
          <>
            <PageHeader
                title="Dados de Produção"
                description="Visualize os dados de produção em tempo real com filtros avançados."
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
        title="Dados de Produção"
        description="Visualize os dados de produção em tempo real com filtros avançados."
      />
      <main className="px-4 sm:px-6 lg:px-8 pb-8">
        <FirebaseRecordsTable initialData={records} />
      </main>
    </>
  );
}

    