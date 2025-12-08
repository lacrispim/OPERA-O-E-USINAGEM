
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  Query,
  DocumentData,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  startAt,
  endAt,
  QueryConstraint,
  FirestoreError,
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

type OrderByConstraint = {
  type: 'orderBy';
  field: string;
  direction?: 'asc' | 'desc';
};

type LimitConstraint = {
  type: 'limit';
  value: number;
};

// Adicione outros tipos de restrição conforme necessário (where, startAfter, etc.)

type CustomQueryConstraint = OrderByConstraint | LimitConstraint;

interface UseCollectionOptions {
  constraints?: CustomQueryConstraint[];
  includeId?: boolean;
}

// Função para mapear nossas restrições personalizadas para as do Firebase
const mapConstraints = (constraints: CustomQueryConstraint[]): QueryConstraint[] => {
  return constraints.map(c => {
    switch (c.type) {
      case 'orderBy':
        return orderBy(c.field, c.direction);
      case 'limit':
        return limit(c.value);
      // Adicione outros casos aqui
      default:
        // Lançar um erro ou retornar um valor padrão pode ser útil para depuração
        throw new Error(`Unsupported constraint type: ${(c as any).type}`);
    }
  });
};


export function useCollection<T>(
  path: string,
  options: UseCollectionOptions = {}
) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const memoizedConstraints = useMemo(() => options.constraints || [], [JSON.stringify(options.constraints)]);

  useEffect(() => {
    if (!firestore) return;

    const { includeId = true } = options;

    try {
      const firebaseConstraints = memoizedConstraints.length > 0 ? mapConstraints(memoizedConstraints) : [];
      const collectionRef = collection(firestore, path);
      const q = query(collectionRef, ...firebaseConstraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const result: T[] = [];
          snapshot.forEach((doc) => {
            const docData = doc.data() as T;
            if (includeId) {
              (docData as any).id = doc.id;
            }
            result.push(docData);
          });
          setData(result);
          setLoading(false);
          setError(null);
        },
        (err: FirestoreError) => {
          const permissionError = new FirestorePermissionError({
            path: path,
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
          setError(err);
          setLoading(false);
        }
      );

      return () => unsubscribe();

    } catch (e: any) {
        console.error("Failed to construct query:", e);
        setError(e);
        setLoading(false);
    }
  }, [firestore, path, memoizedConstraints, options.includeId]);

  return { data, loading, error };
}

export {
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  startAt,
  endAt,
};
