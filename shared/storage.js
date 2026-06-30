import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, isFirebaseReady } from "./firebase.js";

export async function uploadIssuePhoto(userId, file, index = 0) {
  if (!isFirebaseReady()) throw new Error("Firebase not configured");
  const timestamp = Date.now();
  const fileName = `${timestamp}_${index}.jpg`;
  const storageRef = ref(storage, `issues/${userId}/${fileName}`);
  
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function uploadResolutionPhoto(userId, file) {
  if (!isFirebaseReady()) throw new Error("Firebase not configured");
  const timestamp = Date.now();
  const storageRef = ref(storage, `resolutions/${userId}/${timestamp}.jpg`);
  
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function uploadAvatar(userId, file) {
  if (!isFirebaseReady()) throw new Error("Firebase not configured");
  const storageRef = ref(storage, `avatars/${userId}`);
  
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
