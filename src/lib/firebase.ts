// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
