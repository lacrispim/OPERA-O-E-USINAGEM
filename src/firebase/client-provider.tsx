
'use client';

import { ReactNode } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

// Initialize Firebase on the client
const { firebaseApp, firestore, auth, database } = initializeFirebase();

export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  // The provider's only responsibility is to make the Firebase instances available to the app.
  // Authentication flow and redirects are handled by the middleware.
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
