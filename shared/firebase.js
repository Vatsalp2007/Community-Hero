import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";
import { APP_CONFIG } from "./config.js";

const firebaseConfig = APP_CONFIG.firebase;

let app = null;
let auth = null;
let db = null;
let storage = null;
let messaging = null;

const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch(() => {});
    db = getFirestore(app);
    storage = getStorage(app);
    messaging = isSupported().then(yes => yes ? getMessaging(app) : null);
  } catch (e) {
    console.warn("Firebase initialization failed:", e.message);
  }
} else {
  console.warn("Firebase not configured. Set VITE_FIREBASE_* env variables in your .env file.");
}

export { app, auth, db, storage, messaging };
export const isFirebaseReady = () => isConfigured && app !== null;
