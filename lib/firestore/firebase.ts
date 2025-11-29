import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, enableNetwork, disableNetwork, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA0TVOUiWrXPAY5jJO_DIGMRizzA4swQ2o",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "e-commerce-8a28e.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "e-commerce-8a28e",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "e-commerce-8a28e.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "202172213521",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:202172213521:web:5ffaca60fb26d5e66ac4b0",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ZM33G6VF6Q"
};

function validateFirebaseConfig(config: typeof firebaseConfig): boolean {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'] as const;
  
  for (const field of requiredFields) {
    const value = config[field];
    if (!value || value === 'undefined' || value.startsWith('your_')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing Firebase config: ${field}`);
      }
      return false;
    }
  }
  return true;
}

let isConfigValid = false;
try {
  isConfigValid = validateFirebaseConfig(firebaseConfig);
} catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Firebase config validation failed:', error);
  }
  isConfigValid = false;
}

let app: FirebaseApp | undefined;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isConfigValid) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Firebase initialization failed:', error);
    }
    auth = null;
    db = null;
    storage = null;
  }
} else {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Firebase config invalid - services disabled');
  }
}

export { auth, db, storage };

if (typeof window !== 'undefined' && db) {
  window.addEventListener('online', () => {
    if (db) enableNetwork(db).catch(() => {});
  });
  
  window.addEventListener('offline', () => {
    if (db) disableNetwork(db).catch(() => {});
  });
}

export default app;
