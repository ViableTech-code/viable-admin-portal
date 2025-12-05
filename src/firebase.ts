// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBjyIgNz3mcbbt9Y-RyEfvOBCINWE2aDu0",
  authDomain: "winter-legend-461709-t1.firebaseapp.com",
  projectId: "winter-legend-461709-t1",
  storageBucket: "winter-legend-461709-t1.firebasestorage.app",
  messagingSenderId: "864391407297",
  appId: "1:864391407297:web:a15defddeddaa3bdd55640"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
