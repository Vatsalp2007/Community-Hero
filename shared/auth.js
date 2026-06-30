import { 
  signInWithPopup, GoogleAuthProvider, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";
import { auth, db, isFirebaseReady } from "./firebase.js";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

export function onAuthChange(callback) {
  if (!isFirebaseReady()) { callback(null); return () => {}; }
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  if (!isFirebaseReady()) throw new Error("Firebase not configured. Add your credentials to .env");
  return signInWithPopup(auth, googleProvider);
}

export async function signInWithEmail(email, password) {
  if (!isFirebaseReady()) throw new Error("Firebase not configured. Add your credentials to .env");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email, password) {
  if (!isFirebaseReady()) throw new Error("Firebase not configured. Add your credentials to .env");
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  if (!isFirebaseReady()) throw new Error("Firebase not configured. Add your credentials to .env");
  return firebaseSignOut(auth);
}

export async function resetPassword(email) {
  if (!isFirebaseReady()) throw new Error("Firebase not configured. Add your credentials to .env");
  return sendPasswordResetEmail(auth, email);
}

export async function getUserProfile(uid) {
  if (!isFirebaseReady()) return null;
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function createUserProfile(user, role = "citizen") {
  if (!isFirebaseReady()) throw new Error("Firebase not configured. Add your credentials to .env");
  const userRef = doc(db, "users", user.uid);
  const existing = await getDoc(userRef);
  if (existing.exists()) return existing.data();
  
  const profile = {
    uid: user.uid,
    displayName: user.displayName || user.email?.split("@")[0] || "User",
    email: user.email,
    photoURL: user.photoURL || null,
    role,
    city: "",
    ward: "",
    civicScore: 0,
    level: "bronze",
    badgeIds: [],
    totalReports: 0,
    totalResolved: 0,
    createdAt: serverTimestamp(),
    fcmToken: null,
    notificationsEnabled: true
  };
  
  await setDoc(userRef, profile);
  return profile;
}
