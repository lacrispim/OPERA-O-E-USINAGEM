'use client';

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';

// This hook is no longer in use since authentication has been removed.
// It is kept for reference but can be safely deleted.
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // No-op
  }, []);

  return { user, loading };
}
