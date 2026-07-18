//Import function dari SDKs
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

//Konfigurasi Firebase menggunakan .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

//Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

//Inisialisasi Realtime Database dan export agar bisa dipakai di file lain
export const db = getDatabase(app);