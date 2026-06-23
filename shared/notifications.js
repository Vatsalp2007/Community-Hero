import { getToken, onMessage } from "firebase/messaging";
import { messaging, db, isFirebaseReady } from "./firebase.js";
import { doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export async function setupPushNotifications(userId) {
  if (!isFirebaseReady()) return;
  const messagingInstance = await messaging;
  if (!messagingInstance) return;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;
    
    const token = await getToken(messagingInstance, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });
    
    if (token && userId) {
      await updateDoc(doc(db, "users", userId), { fcmToken: token });
    }
    
    onMessage(messagingInstance, (payload) => {
      toast(payload.notification?.body || "Issue update", { icon: "🔔" });
    });
  } catch (e) {
    console.warn("Push notification setup failed:", e);
  }
}
