
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDc-4wulk7iAeKbLs2sH7kuIevYb-VDwn0",
  authDomain: "fabritrack-a839f.firebaseapp.com",
  databaseURL: "https://fabritrack-view-default-rtdb.firebaseio.com/",
  projectId: "fabritrack-a839f",
  storageBucket: "fabritrack-a839f.appspot.com",
  messagingSenderId: "1070180776404",
  appId: "1:1070180776404:web:324d335c9f454282b545ab"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const database = getDatabase(app);
const firestore = getFirestore(app);

export { app, database, firestore };
