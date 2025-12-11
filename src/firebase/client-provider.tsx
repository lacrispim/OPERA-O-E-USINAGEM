
'use client';

import { ReactNode, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { useUser } from './auth/use-user';
import { useRouter, usePathname } from 'next/navigation';

// Initialize Firebase on the client
const { firebaseApp, firestore, auth, database } = initializeFirebase();

export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const protectedRoutes = ['/shop-floor', '/registros-firebase'];
  const authRoutes = ['/login', '/signup'];

  useEffect(() => {
    if (!loading) {
      const isAuthenticated = !!user;
      
      if (isAuthenticated && authRoutes.includes(pathname)) {
        router.replace('/shop-floor');
      }
      
      if (!isAuthenticated && protectedRoutes.some(p => pathname.startsWith(p))) {
        router.replace('/login');
      }
    }
  }, [user, loading, router, pathname]);

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
