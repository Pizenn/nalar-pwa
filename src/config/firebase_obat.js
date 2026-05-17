import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfigObat = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY_OBAT,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN_OBAT,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL_OBAT,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID_OBAT,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET_OBAT,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID_OBAT,
  appId: import.meta.env.VITE_FIREBASE_APP_ID_OBAT,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID_OBAT
};

let app_obat;

if (!getApps().length) {
  // Jika belum ada sama sekali, inisialisasi (biasanya terjadi saat muat ulang halaman pertama kali)
  app_obat = initializeApp(firebaseConfigObat, 'obatApp');
} else {
  try {
    // Coba ambil aplikasi yang bernama 'obatApp' jika sudah ada
    app_obat = getApp('obatApp');
  } catch (error) {
    // Jika getApps().length > 0 (karena db skrining sudah ada), 
    // tapi 'obatApp' belum ada, maka buat baru.
    app_obat = initializeApp(firebaseConfigObat, 'obatApp');
  }
}

// Export database-nya
export const db_obat = getDatabase(app_obat);
