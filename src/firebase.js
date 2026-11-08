import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ---------------------------------------------------------------------------
// 🔑 Firebase Configuration
// ปลอดภัยด้วยการดึงค่าผ่าน Environment Variables (Vercel & .env)
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD_GFHM3xkMBjTa1648m537-T-qQl7-JG4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "zeza-clothing.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "zeza-clothing",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "zeza-clothing.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1092548101933",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1092548101933:web:3e68a06aca77aa456975a4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-EZE8KRS3RZ"
};

let app;
let auth;
let db;
let storage;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (err) {
  console.error("Firebase Init Error:", err);
}

export { app, auth, db, storage, firebaseConfig };
