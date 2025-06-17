// Import the functions you need from the Firebase SDKs
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Log configuration status for debugging
console.log("Firebase Config Status:", {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasAppId: !!firebaseConfig.appId,
});

// Validate required configuration values
const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingConfig = requiredConfig.filter(key => !firebaseConfig[key]);

if (missingConfig.length > 0) {
  console.error('Missing Firebase configuration values:', missingConfig);
  console.error('Please update your .env.local file with your actual Firebase project configuration.');
  console.error('You can find these values in your Firebase Console > Project Settings > General tab');
}

// Initialize Firebase (Prevent duplicate initialization)
let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error('Firebase initialization error:', error);
  app = null;
}

// Initialize Firebase Services with error handling
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

// Initialize Analytics (Only if supported and app is initialized)
export const analytics = app ? isSupported().then((yes) => (yes ? getAnalytics(app) : null)) : null;

// Log service initialization status
console.log("Firebase Services Status:", {
  auth: !!auth,
  db: !!db,
  storage: !!storage,
  app: !!app
});

export default app;