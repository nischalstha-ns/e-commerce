import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services with optimizations
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);



// Enable offline persistence and optimize settings
if (typeof window !== 'undefined') {
  import('firebase/firestore').then(({ enableNetwork, connectFirestoreEmulator, initializeFirestore, CACHE_SIZE_UNLIMITED }) => {
    // Enable network for real-time updates
    enableNetwork(db).catch(() => {});
  });
  
  // Set auth persistence
  import('firebase/auth').then(({ setPersistence, browserLocalPersistence }) => {
    setPersistence(auth, browserLocalPersistence).catch(() => {});
  });
}

export default app;