import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBORgBnaOCzoR6fzUaMKbLzquk2IPHLuxY",
  authDomain: "money-tracker-a2820.firebaseapp.com",
  projectId: "money-tracker-a2820",
  storageBucket: "money-tracker-a2820.firebasestorage.app",
  messagingSenderId: "6787101311",
  appId: "1:6787101311:web:a1b9b69edfebe7aa9fc54a",
  measurementId: "G-5ERJ4EJE7S"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };