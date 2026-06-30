import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const AHMEDABAD_COORDS = [
  { lat: 23.0225, lng: 72.5714 },
  { lat: 23.0300, lng: 72.5600 },
  { lat: 23.0150, lng: 72.5800 },
  { lat: 23.0350, lng: 72.5650 },
  { lat: 23.0200, lng: 72.5550 },
  { lat: 23.0280, lng: 72.5750 },
  { lat: 23.0180, lng: 72.5680 },
  { lat: 23.0320, lng: 72.5620 },
  { lat: 23.0260, lng: 72.5580 },
  { lat: 23.0140, lng: 72.5720 },
  { lat: 23.0380, lng: 72.5690 },
  { lat: 23.0240, lng: 72.5770 },
  { lat: 23.0160, lng: 72.5630 },
  { lat: 23.0310, lng: 72.5530 },
  { lat: 23.0190, lng: 72.5760 }
];

const WARDS = ["Ward 1 - Navrangpura", "Ward 2 - Shahibaug", "Ward 3 - Satellite", "Ward 4 - Ellis Bridge", "Ward 5 - Ambawadi"];

const DEMO_ISSUES = [
  { category: "pothole", title: "Large pothole on Ashram Road", description: "Deep pothole near bus stop causing traffic jams", severity: 4, status: "open" },
  { category: "streetlight", title: "Broken streetlight in Bopal", description: "Street light not working for 3 days near school", severity: 3, status: "verified" },
  { category: "water_leak", title: "Water pipe burst in CG Road", description: "Major water leak flooding the sidewalk", severity: 5, status: "in_progress", department: "water" },
  { category: "garbage", title: "Garbage dump near Sarkhej", description: "Overflowing garbage bins attracting stray animals", severity: 3, status: "open" },
  { category: "manhole", title: "Open manhole near SG Highway", description: "Cover missing, dangerous for pedestrians", severity: 5, status: "verified" }
];

const DEMO_USERS = [
  { email: "demo@jansetu.app", password: "Demo@1234", displayName: "Rahul Sharma", role: "citizen", civicScore: 350, level: "gold", totalReports: 8, totalResolved: 3 },
  { email: "officer@jansetu.app", password: "Officer@1234", displayName: "Priya Patel", role: "officer", civicScore: 100, level: "silver", totalReports: 2, totalResolved: 0 },
  { email: "admin@jansetu.app", password: "Admin@1234", displayName: "Amit Joshi", role: "admin", civicScore: 50, level: "bronze", totalReports: 0, totalResolved: 0 }
];

async function seedUsers() {
  console.log("Seeding users...");
  const userIds = [];

  for (const userData of DEMO_USERS) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const uid = cred.user.uid;
      userIds.push(uid);

      await setDoc(doc(db, "users", uid), {
        uid,
        displayName: userData.displayName,
        email: userData.email,
        photoURL: null,
        role: userData.role,
        city: "Ahmedabad",
        ward: WARDS[Math.floor(Math.random() * WARDS.length)],
        civicScore: userData.civicScore,
        level: userData.level,
        badgeIds: userData.civicScore > 200 ? ["first_report", "century_club"] : ["first_report"],
        totalReports: userData.totalReports,
        totalResolved: userData.totalResolved,
        createdAt: serverTimestamp(),
        fcmToken: null,
        notificationsEnabled: true
      });

      console.log(`  Created user: ${userData.email} (${userData.role})`);
    } catch (e) {
      console.log(`  User ${userData.email} may already exist: ${e.message}`);
    }
  }

  return userIds;
}

async function seedIssues(citizenUid) {
  console.log("Seeding issues...");

  for (let i = 0; i < DEMO_ISSUES.length; i++) {
    const issueData = DEMO_ISSUES[i];
    const coords = AHMEDABAD_COORDS[i % AHMEDABAD_COORDS.length];
    const ward = WARDS[i % WARDS.length];
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(Date.now() - daysAgo * 86400000);

    const departments = { pothole: "roads", streetlight: "electricity", water_leak: "water", garbage: "sanitation", manhole: "roads", road_damage: "roads", other: "other" };

    const issue = {
      reportedBy: citizenUid,
      reporterName: "Rahul Sharma",
      reporterPhoto: null,
      title: issueData.title,
      description: issueData.description,
      category: issueData.category,
      severity: issueData.severity,
      status: issueData.status,
      department: departments[issueData.category],
      location: { latitude: coords.lat, longitude: coords.lng },
      address: `${issueData.title.split(' ').slice(0, 3).join(' ')}, ${ward}, Ahmedabad`,
      ward,
      city: "Ahmedabad",
      mediaUrls: [],
      thumbnailUrl: "",
      aiClassification: { labels: [issueData.category], confidence: 75 + Math.floor(Math.random() * 20), rawResponse: {} },
      upvotes: Math.floor(Math.random() * 12),
      upvotedBy: [],
      verifiedBy: [],
      isVerified: issueData.status === "verified",
      duplicateOf: null,
      assignedDept: issueData.department || "",
      assignedAt: ["assigned", "in_progress", "resolved"].includes(issueData.status) ? createdAt : null,
      resolvedAt: issueData.status === "resolved" ? new Date() : null,
      resolvedBy: issueData.status === "resolved" ? "officer" : null,
      resolutionNote: issueData.status === "resolved" ? "Issue has been fixed." : null,
      resolutionPhotoUrl: null,
      rejectionReason: null,
      geohash: "",
      trackingId: `AHM-2026-${10000 + i}`,
      createdAt,
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, "issues"), issue);

    await addDoc(collection(db, "issues", docRef.id, "timeline"), {
      type: "created",
      description: "Issue reported",
      actorId: citizenUid,
      actorName: "Rahul Sharma",
      newStatus: "open",
      createdAt
    });

    if (issueData.status === "verified") {
      await addDoc(collection(db, "issues", docRef.id, "timeline"), {
        type: "verified",
        description: "Community verified - reached 5 upvotes",
        actorId: "system",
        actorName: "Community",
        newStatus: "verified",
        createdAt: new Date(createdAt.getTime() + 86400000)
      });
    }

    if (["in_progress", "resolved"].includes(issueData.status)) {
      await addDoc(collection(db, "issues", docRef.id, "timeline"), {
        type: "assigned",
        description: `Assigned to ${departments[issueData.category]} department`,
        actorId: "system",
        actorName: "System",
        newStatus: "assigned",
        createdAt: new Date(createdAt.getTime() + 172800000)
      });
    }

    if (issueData.status === "resolved") {
      await addDoc(collection(db, "issues", docRef.id, "timeline"), {
        type: "resolved",
        description: "Issue resolved",
        actorId: "officer",
        actorName: "Priya Patel",
        newStatus: "resolved",
        createdAt: new Date()
      });
    }

    console.log(`  Created issue: ${issueData.title}`);
  }
}

async function main() {
  console.log("=== JANSETU AI Seed Data Script ===\n");

  const userIds = await seedUsers();

  if (userIds.length > 0) {
    await seedIssues(userIds[0]);
  }

  console.log("\n=== Seeding complete! ===");
  console.log("\nDemo Accounts:");
  DEMO_USERS.forEach(u => console.log(`  ${u.role}: ${u.email} / ${u.password}`));
}

main().catch(console.error);
