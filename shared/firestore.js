import { doc, updateDoc, increment, collection, addDoc, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db, isFirebaseReady } from "./firebase.js";
import { CIVIC_SCORE_EVENTS, LEVEL_THRESHOLDS, BADGES, UPVOTE_THRESHOLD } from "./constants.js";

export function generateTrackingId(city = "AHM") {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `${city.toUpperCase()}-${year}-${random}`;
}

export async function awardCivicPoints(userId, eventType) {
  if (!isFirebaseReady()) return;
  const points = CIVIC_SCORE_EVENTS[eventType] || 0;
  if (points === 0) return;
  
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    civicScore: increment(points)
  });
}

export function calculateLevel(score) {
  if (score >= LEVEL_THRESHOLDS.hero) return "hero";
  if (score >= LEVEL_THRESHOLDS.platinum) return "platinum";
  if (score >= LEVEL_THRESHOLDS.gold) return "gold";
  if (score >= LEVEL_THRESHOLDS.silver) return "silver";
  return "bronze";
}

export async function createIssue(issueData) {
  if (!isFirebaseReady()) throw new Error("Firebase not configured");
  const docRef = await addDoc(collection(db, "issues"), {
    ...issueData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  await addDoc(collection(db, "issues", docRef.id, "timeline"), {
    type: "created",
    description: "Issue reported",
    actorId: issueData.reportedBy,
    actorName: issueData.reporterName,
    newStatus: "open",
    createdAt: new Date()
  });
  
  return docRef.id;
}

export async function addComment(issueId, commentData) {
  if (!isFirebaseReady()) throw new Error("Firebase not configured");
  return addDoc(collection(db, "issues", issueId, "comments"), {
    ...commentData,
    createdAt: new Date()
  });
}

export async function addTimelineEvent(issueId, eventData) {
  if (!isFirebaseReady()) throw new Error("Firebase not configured");
  return addDoc(collection(db, "issues", issueId, "timeline"), {
    ...eventData,
    createdAt: new Date()
  });
}
