
import { initializeFirebase } from '@/firebase';

const { firebaseApp, firestore, auth, database } = initializeFirebase();

export { firebaseApp as app, database, firestore, auth };
