
'use client';

import { ReactNode } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { useUser } from './auth/use-user';
import { usePathname } from 'next/navigation';

// Initialize Firebase on the client
const { firebaseApp, firestore, auth, database } = initializeFirebase();

export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  // We still use useUser to initialize the auth state listener,
  // but the redirection logic is now handled by the middleware.
  useUser();

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
      auth={auth}
      database={database}
    >
      {children}
    </FirebaseProvider>
  );
};
