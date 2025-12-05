
"use client";

import { ReactNode, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { initializeFirebase, FirebaseProvider } from '@/firebase';

type Props = {
  children: ReactNode;
};

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;

export function FirebaseClientProvider({ children }: Props) {
  const firebaseContext = useMemo(() => {
    if (!app) {
      const { firebaseApp, firestore: fs, auth: au } = initializeFirebase();
      app = firebaseApp;
      firestore = fs;
      auth = au;
    }

    return {
      firebaseApp: app,
      firestore,
      auth,
    };
  }, []);

  return <FirebaseProvider {...firebaseContext}>{children}</FirebaseProvider>;
}
