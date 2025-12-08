
"use client";

import { ReactNode, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { Database } from 'firebase/database';
import { initializeFirebase, FirebaseProvider } from '@/firebase';

type Props = {
  children: ReactNode;
};

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;
let database: Database | null = null;

export function FirebaseClientProvider({ children }: Props) {
  const firebaseContext = useMemo(() => {
    // This ensures that Firebase is initialized only once on the client.
    if (!app) {
      const { firebaseApp, firestore: fs, auth: au, database: db } = initializeFirebase();
      app = firebaseApp;
      firestore = fs;
      auth = au;
      database = db;
    }

    return {
      firebaseApp: app,
      firestore,
      auth,
      database,
    };
  }, []);

  return <FirebaseProvider {...firebaseContext}>{children}</FirebaseProvider>;
}
