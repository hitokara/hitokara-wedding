import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXJX0NMcmLJrxs0TDrPDNac4QJqfuXpVk",
  authDomain: "hitokara-wedding.firebaseapp.com",
  projectId: "hitokara-wedding",
  storageBucket: "hitokara-wedding.firebasestorage.app",
  messagingSenderId: "1011356682752",
  appId: "1:1011356682752:web:58eb7727444179766b26e5",
  measurementId: "G-5Y3FQ3XM7T",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
