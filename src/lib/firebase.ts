
import { initializeFirebase } from '@/firebase';

// This file now acts as a singleton provider for the initialized firebase instances.
// This prevents multiple initializations and ensures all components use the same SDK instances.
const { firebaseApp: app, firestore, auth, database } = (() => {
    const { firebaseApp, firestore, auth } = initializeFirebase();
    // Assuming you might need the Realtime Database as well, as it was in the original file.
    const { getDatabase } = require("firebase/database");
    const database = getDatabase(firebaseApp);
    return { firebaseApp, firestore, auth, database };
})();

export { app, database, firestore, auth };
