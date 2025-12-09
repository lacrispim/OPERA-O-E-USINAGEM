'use client';

// This component is no longer used with Realtime Database as the error handling is simpler.
// It can be deleted. It is kept here for reference in case Firestore is re-enabled.

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      if (error instanceof FirestorePermissionError) {
        // In a real app, you might want to log this to a service like Sentry.
        // For development, we throw it to make it visible in the Next.js error overlay.
        throw error;
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null; // This component does not render anything.
}
