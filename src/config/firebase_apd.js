// 1. Tambahkan getApps dan getApp di baris import
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY_APD,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN_APD,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL_APD,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID_APD,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET_APD,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID_APD,
  appId: import.meta.env.VITE_FIREBASE_APP_ID_APD,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID_APD,
};

// 2. Logika Pengecekan Aplikasi (Singleton)
let app;

if (!getApps().length) {
  // Jika belum ada aplikasi sama sekali, inisialisasi dengan nama khusus 'apdApp'
  app = initializeApp(firebaseConfig, 'apdApp');
} else {
  try {
    // Jika sudah ada aplikasi yang berjalan, coba panggil yang bernama 'apdApp'
    app = getApp('apdApp');
  } catch (error) {
    // Jika 'apdApp' belum ada (tapi database lain sudah ada), buat baru
    app = initializeApp(firebaseConfig, 'apdApp');
  }
}

// 3. Export Analytics dan Database dengan app yang sudah divalidasi
export const analytics = getAnalytics(app);
export const db_apd = getDatabase(app);