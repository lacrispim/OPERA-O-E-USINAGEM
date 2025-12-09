
'use client';

import { ReactNode } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import dynamic from 'next/dynamic';

// Initialize Firebase on the client
const { firebaseApp, firestore, auth, database } = initializeFirebase();

const ClientAppShell = dynamic(() => import('@/components/layout/client-app-shell'), {
  ssr: false,
});


export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
      auth={auth}
      database={database}
    >
      <ClientAppShell>{children}</ClientAppShell>
    </FirebaseProvider>
  );
};
