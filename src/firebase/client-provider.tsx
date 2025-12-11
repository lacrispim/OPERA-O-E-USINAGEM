
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

  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  useEffect(() => {
    // Wait until authentication status is resolved
    if (loading) {
      return;
    }

    const isAuthenticated = !!user;

    // If user is logged in and tries to access a public route (login/signup), redirect them to the main app.
    if (isAuthenticated && isPublicRoute) {
      router.replace('/shop-floor');
    }

    // If user is NOT logged in and is trying to access a protected route, redirect to login.
    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
    }

  }, [user, loading, router, pathname, isPublicRoute]);

  // While loading, or if we are about to redirect, we can show nothing or a loader
  if (loading || (!user && !isPublicRoute) || (user && isPublicRoute)) {
    return null; // Or a loading spinner component
  }

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
