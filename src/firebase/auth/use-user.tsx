
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '../provider';
import Cookies from 'js-cookie';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // This is a client-side mechanism to help the middleware.
      // In a production app with server-side rendering, you'd use secure,
      // HTTP-only cookies set from the server.
      if (currentUser) {
        Cookies.set('firebaseAuth.authenticated', 'true', { expires: 1 });
      } else {
        Cookies.remove('firebaseAuth.authenticated');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
