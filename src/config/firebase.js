// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzQpfsPBnd0bNIYrMGhg5uYXjDhgX2_k8",
  authDomain: "nalar-project-dcfc0.firebaseapp.com",
  databaseURL: "https://nalar-project-dcfc0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nalar-project-dcfc0",
  storageBucket: "nalar-project-dcfc0.firebasestorage.app",
  messagingSenderId: "650347212041",
  appId: "1:650347212041:web:388df7a7e0ada7794b37d8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Realtime Database dan export agar bisa dipakai di file lain
export const db = getDatabase(app);