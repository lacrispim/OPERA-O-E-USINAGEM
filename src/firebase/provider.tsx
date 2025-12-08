
'use client';

import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { Database } from 'firebase/database';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

type FirebaseContextType = {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  database: Database | null;
};

export const FirebaseContext = createContext<FirebaseContextType>({
  firebaseApp: null,
  firestore: null,
  auth: null,
  database: null,
});

export const FirebaseProvider = ({
  children,
  firebaseApp,
  firestore,
  auth,
  database,
}: {
  children: ReactNode;
} & FirebaseContextType) => {
  const contextValue = useMemo(
    () => ({
      firebaseApp,
      firestore,
      auth,
      database,
    }),
    [firebaseApp, firestore, auth, database]
  );

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useContext(FirebaseContext)?.firebaseApp;
export const useFirestore = () => useContext(FirebaseContext)?.firestore;
export const useAuth = () => useContext(FirebaseContext)?.auth;
export const useDatabase = () => useContext(FirebaseContext)?.database;
