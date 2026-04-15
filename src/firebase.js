import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "money-tracker-a2820.firebaseapp.com",
  projectId: "money-tracker-a2820",
  storageBucket: "money-tracker-a2820.firebasestorage.app",
  messagingSenderId: "6787101311",
  appId: "1:6787101311:web:a1b9b69edfeb7aa9fc54a",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);