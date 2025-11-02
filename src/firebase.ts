// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFjWdl2g19gEfD86L_dGo2Bg3hMFr_91E",
  authDomain: "trieverse-infotech.firebaseapp.com",
  projectId: "trieverse-infotech",
  storageBucket: "trieverse-infotech.firebasestorage.app",
  messagingSenderId: "454845958179",
  appId: "1:454845958179:web:4b9c7ade3764ce5eae8996",
  measurementId: "G-89FSTDL6X5",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
