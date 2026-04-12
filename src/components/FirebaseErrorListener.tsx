
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Listen for Firestore permission errors emitted globally and re-throw them.
 * This ensures that during development, rich contextual error overlays are shown.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handler = (error: FirestorePermissionError) => {
      // Re-throwing the error here will be caught by the nearest error boundary 
      // or show the Next.js development error overlay.
      throw error;
    };

    errorEmitter.on('permission-error', handler);
  }, []);

  return null;
}
