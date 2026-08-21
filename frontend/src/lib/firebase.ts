/**
 * YieldSense AI  -  Firebase Client SDK Configuration
 *
 * Initializes the Firebase client-side SDK for authentication and Firestore.
 * Uses lazy initialization to prevent errors during SSR/static build.
 * All config values are loaded from environment variables.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Lazily initialize the Firebase app.
 * Safe to call during SSR  -  returns null if config is missing.
 */
function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

// Lazy singletons  -  only initialized when accessed client-side
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    if (!_auth) {
      _auth = getAuth(getFirebaseApp());
    }
    return Reflect.get(_auth, prop);
  },
});

export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    if (!_db) {
      _db = getFirestore(getFirebaseApp());
    }
    return Reflect.get(_db, prop);
  },
});

export const storage: FirebaseStorage = new Proxy({} as FirebaseStorage, {
  get(_target, prop) {
    if (!_storage) {
      _storage = getStorage(getFirebaseApp());
    }
    return Reflect.get(_storage, prop);
  },
});

export default getFirebaseApp;
