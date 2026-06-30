# CivicAI — Full Build Prompt for AI Coding Agent
# Community Hero: Hyperlocal Problem Solver
# Version: 2.0 (Firebase Spark Free Tier — No Cloud Functions)

---

## AGENT INSTRUCTIONS

You are an expert full-stack developer. Build the **complete CivicAI web application** exactly as described in this document. Do not skip any section. Do not ask for clarification — make sensible decisions where details are unspecified. Write production-quality code with proper error handling, loading states, and responsive design throughout.

Build everything in a single monorepo with two apps:
1. `/app` — Citizen-facing React web app (mobile-first)
2. `/admin` — Municipal officer/admin dashboard (desktop-first)

Both apps share a `/shared` folder for Firebase config, types, and utilities.

---

## SECTION 1: PROJECT OVERVIEW

**Project Name:** CivicAI  
**Tagline:** Report. Verify. Resolve. Together.  
**Type:** AI-powered hyperlocal civic issue reporting and resolution platform  
**Problem:** Citizens have no easy, transparent way to report and track community infrastructure issues (potholes, broken streetlights, water leaks, garbage, open manholes). Municipal bodies have no structured data or prioritization system.  
**Solution:** A web platform where citizens report issues with photos, AI auto-classifies them, the community verifies them, and municipal officers resolve them — with full real-time transparency.

---

## SECTION 2: TECH STACK — STRICT REQUIREMENTS

### Frontend
- **Framework:** React 18 + Vite
- **Language:** JavaScript (no TypeScript — keep it simple for speed)
- **Styling:** Tailwind CSS v3
- **UI Components:** shadcn/ui (use Radix UI primitives)
- **Routing:** React Router v6
- **State Management:** Zustand
- **Data Fetching:** React Query (TanStack Query v5)
- **Maps:** @react-google-maps/api
- **Charts:** Recharts
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation
- **Notifications (toast):** react-hot-toast

### Backend — Firebase Spark Free Tier ONLY
- **Authentication:** Firebase Auth (Google OAuth + Email/Password)
- **Database:** Firebase Firestore
- **File Storage:** Firebase Storage
- **Hosting:** Firebase Hosting
- **Real-time:** Firestore `onSnapshot()` listeners
- **Push Notifications:** Firebase Cloud Messaging (FCM)

> ⚠️ CRITICAL CONSTRAINT: NO Firebase Cloud Functions. The Spark free plan does not support Cloud Functions deployment. All logic must run client-side or through direct API calls from the browser.

### AI Classification — Client-Side (No Backend)
- **Method:** Call Google Cloud Vision API directly from the browser using a restricted API key
- **Fallback:** If Vision API call fails or is not configured, show a manual category selection UI
- **Implementation:** `fetch()` to `https://vision.googleapis.com/v1/images:annotate?key=${VITE_VISION_API_KEY}`
- Use `LABEL_DETECTION` and `OBJECT_LOCALIZATION` features
- Map Vision API labels to civic issue categories using a lookup table (defined below)

### Environment Variables Required
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_MAPS_API_KEY=
VITE_VISION_API_KEY=
```

---

## SECTION 3: MONOREPO FOLDER STRUCTURE

```
civicai/
├── shared/
│   ├── firebase.js              # Firebase init (auth, db, storage, messaging)
│   ├── firestore.js             # All Firestore CRUD helpers
│   ├── auth.js                  # Auth helpers (signIn, signOut, onAuthChange)
│   ├── storage.js               # Storage upload helpers
│   ├── visionApi.js             # Google Vision API client-side caller
│   ├── classifyIssue.js         # Maps Vision labels → civic categories
│   ├── notifications.js         # FCM setup and helpers
│   ├── constants.js             # Categories, severity levels, status enums
│   └── types.js                 # JSDoc type definitions
│
├── app/                         # Citizen-facing app
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx              # Routes setup
│   │   ├── store/
│   │   │   ├── authStore.js     # Zustand auth state
│   │   │   └── appStore.js      # Global UI state
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── HomePage.jsx     # Map view (main screen)
│   │   │   ├── ReportPage.jsx   # Submit new issue
│   │   │   ├── IssueDetailPage.jsx
│   │   │   ├── MyReportsPage.jsx
│   │   │   ├── LeaderboardPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── BottomNav.jsx
│   │   │   ├── map/
│   │   │   │   ├── IssueMap.jsx
│   │   │   │   ├── IssueMarker.jsx
│   │   │   │   └── MapFilters.jsx
│   │   │   ├── issues/
│   │   │   │   ├── IssueCard.jsx
│   │   │   │   ├── IssueStatusBadge.jsx
│   │   │   │   ├── IssueTimeline.jsx
│   │   │   │   ├── UpvoteButton.jsx
│   │   │   │   └── CommentSection.jsx
│   │   │   ├── report/
│   │   │   │   ├── PhotoUpload.jsx
│   │   │   │   ├── AIClassifyResult.jsx
│   │   │   │   ├── LocationPicker.jsx
│   │   │   │   └── CategorySelector.jsx
│   │   │   ├── gamification/
│   │   │   │   ├── CivicScoreCard.jsx
│   │   │   │   ├── BadgeGrid.jsx
│   │   │   │   └── LeaderboardRow.jsx
│   │   │   └── ui/                # shadcn/ui components
│   │   └── hooks/
│   │       ├── useAuth.js
│   │       ├── useIssues.js
│   │       ├── useGeolocation.js
│   │       └── useUpvote.js
│
├── admin/                        # Officer/Admin dashboard
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── DashboardPage.jsx   # Overview stats
│       │   ├── IssuesPage.jsx      # Full issue queue
│       │   ├── IssueDetailPage.jsx # Manage single issue
│       │   ├── MapPage.jsx         # Heatmap + all issues
│       │   ├── AnalyticsPage.jsx   # Charts and reports
│       │   └── UsersPage.jsx       # Manage roles
│       └── components/
│           ├── layout/
│           │   ├── Sidebar.jsx
│           │   └── TopBar.jsx
│           ├── dashboard/
│           │   ├── StatsCards.jsx
│           │   ├── ResolutionChart.jsx
│           │   ├── CategoryPieChart.jsx
│           │   └── RecentIssuesFeed.jsx
│           ├── issues/
│           │   ├── IssueTable.jsx
│           │   ├── IssueFilters.jsx
│           │   ├── StatusUpdateModal.jsx
│           │   └── AssignDeptModal.jsx
│           └── ui/
│
├── firebase.json                  # Firebase hosting config (both apps)
├── .firebaserc
└── package.json                   # Root with workspaces
```

---

## SECTION 4: FIREBASE FIRESTORE SCHEMA

### Collection: `/users/{uid}`
```javascript
{
  uid: string,                    // Firebase Auth UID
  displayName: string,
  email: string,
  photoURL: string,
  role: "citizen" | "moderator" | "officer" | "admin",
  city: string,
  ward: string,
  civicScore: number,             // default: 0
  level: "bronze" | "silver" | "gold" | "platinum" | "hero",
  badgeIds: array,                // ["pothole_hunter", "first_report", ...]
  totalReports: number,
  totalResolved: number,
  createdAt: timestamp,
  fcmToken: string,               // for push notifications
  notificationsEnabled: boolean
}
```

### Collection: `/issues/{issueId}`
```javascript
{
  issueId: string,                // auto-generated
  reportedBy: string,             // uid
  reporterName: string,
  reporterPhoto: string,
  title: string,                  // AI-generated or user-provided
  description: string,            // optional, max 500 chars
  category: string,               // "pothole" | "streetlight" | "water_leak" | "garbage" | "manhole" | "road_damage" | "other"
  severity: number,               // 1-5 (AI assigned or user selected)
  status: string,                 // "open" | "verified" | "assigned" | "in_progress" | "resolved" | "rejected"
  department: string,             // "roads" | "water" | "sanitation" | "electricity" | "other"
  location: GeoPoint,             // Firestore GeoPoint
  address: string,                // reverse geocoded
  ward: string,
  city: string,
  mediaUrls: array,               // Firebase Storage URLs
  thumbnailUrl: string,           // first photo (for cards)
  aiClassification: {
    labels: array,
    confidence: number,
    rawResponse: object
  },
  upvotes: number,                // default: 0
  upvotedBy: array,               // [uid, uid, ...] — for dedup
  verifiedBy: array,              // moderator UIDs
  isVerified: boolean,            // true when upvotes >= 5
  duplicateOf: string | null,
  assignedDept: string,
  assignedAt: timestamp | null,
  resolvedAt: timestamp | null,
  resolvedBy: string | null,
  resolutionNote: string | null,
  resolutionPhotoUrl: string | null,
  rejectionReason: string | null,
  createdAt: timestamp,
  updatedAt: timestamp,
  geohash: string                 // for geo queries
}
```

### Subcollection: `/issues/{issueId}/comments/{commentId}`
```javascript
{
  commentId: string,
  authorId: string,
  authorName: string,
  authorPhoto: string,
  authorRole: string,
  text: string,
  createdAt: timestamp
}
```

### Subcollection: `/issues/{issueId}/timeline/{eventId}`
```javascript
{
  eventId: string,
  type: "created" | "verified" | "assigned" | "status_changed" | "resolved" | "rejected" | "commented",
  description: string,
  actorId: string,
  actorName: string,
  newStatus: string,
  createdAt: timestamp
}
```

### Collection: `/leaderboard/{city}/weekly/{uid}`
```javascript
{
  uid: string,
  displayName: string,
  photoURL: string,
  weeklyScore: number,
  totalScore: number,
  weekStart: timestamp
}
```

---

## SECTION 5: FIREBASE SECURITY RULES

Write these exact Firestore Security Rules in `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return request.auth.uid == uid;
    }

    function getRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isOfficer() {
      return isAuth() && getRole() in ['officer', 'admin'];
    }

    function isAdmin() {
      return isAuth() && getRole() == 'admin';
    }

    function isModerator() {
      return isAuth() && getRole() in ['moderator', 'officer', 'admin'];
    }

    // Users collection
    match /users/{uid} {
      allow read: if isAuth();
      allow create: if isOwner(uid);
      allow update: if isOwner(uid) || isAdmin();
    }

    // Issues collection — public read, auth write
    match /issues/{issueId} {
      allow read: if true;
      allow create: if isAuth();
      allow update: if isAuth() && (
        isOfficer() ||
        isModerator() ||
        (isOwner(resource.data.reportedBy) && 
         request.resource.data.status == resource.data.status)
      );
      allow delete: if isAdmin();

      // Comments — auth required
      match /comments/{commentId} {
        allow read: if true;
        allow create: if isAuth();
        allow delete: if isAdmin();
      }

      // Timeline — read only for citizens
      match /timeline/{eventId} {
        allow read: if true;
        allow write: if isAuth();
      }
    }

    // Leaderboard — public read
    match /leaderboard/{city}/weekly/{uid} {
      allow read: if true;
      allow write: if isAuth() && isOwner(uid);
    }
  }
}
```

Write these Storage Rules in `storage.rules`:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /issues/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 10 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
    match /resolutions/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /avatars/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## SECTION 6: CONSTANTS AND ENUMS

### `shared/constants.js` — Write this file exactly:

```javascript
export const ISSUE_CATEGORIES = {
  pothole: {
    label: "Pothole",
    icon: "circle-dot",
    color: "#DC2626",
    department: "roads",
    visionLabels: ["pothole", "road", "asphalt", "pavement", "crack", "hole"]
  },
  streetlight: {
    label: "Broken Streetlight",
    icon: "lamp-street",
    color: "#D97706",
    department: "electricity",
    visionLabels: ["street light", "lamp post", "light fixture", "lamppost"]
  },
  water_leak: {
    label: "Water Leakage",
    icon: "droplets",
    color: "#2563EB",
    department: "water",
    visionLabels: ["water", "flood", "leak", "puddle", "pipe", "drainage", "waterlogged"]
  },
  garbage: {
    label: "Garbage / Waste",
    icon: "trash-2",
    color: "#16A34A",
    department: "sanitation",
    visionLabels: ["garbage", "waste", "trash", "litter", "dump", "rubbish"]
  },
  manhole: {
    label: "Open Manhole",
    icon: "circle-off",
    color: "#7C3AED",
    department: "roads",
    visionLabels: ["manhole", "sewer", "grate", "cover", "drain"]
  },
  road_damage: {
    label: "Road Damage",
    icon: "road",
    color: "#EA580C",
    department: "roads",
    visionLabels: ["road", "street", "damage", "broken", "construction"]
  },
  other: {
    label: "Other Issue",
    icon: "alert-circle",
    color: "#6B7280",
    department: "other",
    visionLabels: []
  }
};

export const SEVERITY_LEVELS = {
  1: { label: "Low", color: "#16A34A", description: "Minor inconvenience" },
  2: { label: "Minor", color: "#65A30D", description: "Needs attention soon" },
  3: { label: "Moderate", color: "#D97706", description: "Affects daily life" },
  4: { label: "High", color: "#EA580C", description: "Safety concern" },
  5: { label: "Critical", color: "#DC2626", description: "Immediate danger" }
};

export const ISSUE_STATUSES = {
  open: { label: "Open", color: "#6B7280", bg: "#F3F4F6" },
  verified: { label: "Community Verified", color: "#16A34A", bg: "#F0FDF4" },
  assigned: { label: "Assigned", color: "#2563EB", bg: "#EFF6FF" },
  in_progress: { label: "In Progress", color: "#D97706", bg: "#FFFBEB" },
  resolved: { label: "Resolved", color: "#16A34A", bg: "#F0FDF4" },
  rejected: { label: "Rejected", color: "#DC2626", bg: "#FEF2F2" }
};

export const DEPARTMENTS = {
  roads: "Roads & Infrastructure",
  water: "Water & Sewerage",
  sanitation: "Sanitation & Waste",
  electricity: "Electricity & Streetlights",
  other: "General Administration"
};

export const CIVIC_SCORE_EVENTS = {
  report_accepted: 20,
  report_verified: 50,
  report_resolved: 100,
  upvote_verified: 5,
  moderator_verify: 30,
  streak_bonus: 25,
  first_in_ward: 75
};

export const LEVEL_THRESHOLDS = {
  bronze: 0,
  silver: 200,
  gold: 500,
  platinum: 1000,
  hero: 2500
};

export const BADGES = [
  { id: "first_report", label: "First Report", description: "Submitted your first issue", icon: "flag" },
  { id: "pothole_hunter", label: "Pothole Hunter", description: "Reported 5 potholes", icon: "circle-dot" },
  { id: "water_warrior", label: "Water Warrior", description: "Reported 5 water leaks", icon: "droplets" },
  { id: "street_guardian", label: "Street Guardian", description: "Reported 5 streetlight issues", icon: "lamp-street" },
  { id: "century_club", label: "Century Club", description: "100 civic score points", icon: "award" },
  { id: "verified_reporter", label: "Verified Reporter", description: "3 reports verified by community", icon: "badge-check" },
  { id: "resolver", label: "Problem Solver", description: "5 of your reports resolved", icon: "check-circle" }
];

export const UPVOTE_THRESHOLD = 5; // upvotes needed for community verification

export const MAP_CENTER_DEFAULT = { lat: 23.0225, lng: 72.5714 }; // Ahmedabad
export const MAP_ZOOM_DEFAULT = 13;
```

---

## SECTION 7: AI CLASSIFICATION — CLIENT-SIDE

### `shared/visionApi.js`
```javascript
const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${import.meta.env.VITE_VISION_API_KEY}`;

export async function analyzeImageWithVision(base64Image) {
  if (!import.meta.env.VITE_VISION_API_KEY) {
    return null; // graceful fallback
  }
  
  const body = {
    requests: [{
      image: { content: base64Image },
      features: [
        { type: "LABEL_DETECTION", maxResults: 15 },
        { type: "OBJECT_LOCALIZATION", maxResults: 10 },
        { type: "SAFE_SEARCH_DETECTION" }
      ]
    }]
  };
  
  const response = await fetch(VISION_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) return null;
  const data = await response.json();
  return data.responses?.[0] || null;
}
```

### `shared/classifyIssue.js`
```javascript
import { ISSUE_CATEGORIES } from "./constants.js";

export function classifyFromVisionResponse(visionResponse) {
  if (!visionResponse) return getDefaultClassification();
  
  const labels = [
    ...(visionResponse.labelAnnotations || []).map(l => l.description.toLowerCase()),
    ...(visionResponse.localizedObjectAnnotations || []).map(o => o.name.toLowerCase())
  ];
  
  let bestMatch = { category: "other", score: 0, confidence: 0 };
  
  for (const [categoryKey, categoryData] of Object.entries(ISSUE_CATEGORIES)) {
    if (categoryKey === "other") continue;
    let score = 0;
    
    for (const visionLabel of labels) {
      for (const keyword of categoryData.visionLabels) {
        if (visionLabel.includes(keyword) || keyword.includes(visionLabel)) {
          const labelObj = visionResponse.labelAnnotations?.find(
            l => l.description.toLowerCase().includes(keyword)
          );
          score += labelObj?.score || 0.5;
        }
      }
    }
    
    if (score > bestMatch.score) {
      bestMatch = { category: categoryKey, score, confidence: Math.min(score * 100, 99) };
    }
  }
  
  const category = bestMatch.category;
  const categoryData = ISSUE_CATEGORIES[category];
  
  // Auto-assign severity based on category and confidence
  const severity = getSeverityFromCategory(category, bestMatch.confidence);
  
  return {
    category,
    categoryLabel: categoryData.label,
    department: categoryData.department,
    severity,
    confidence: Math.round(bestMatch.confidence),
    suggestedTitle: generateTitle(category),
    labels: labels.slice(0, 5)
  };
}

function getSeverityFromCategory(category, confidence) {
  const baseSeverity = {
    manhole: 5, pothole: 4, water_leak: 3,
    streetlight: 3, road_damage: 3, garbage: 2, other: 2
  };
  return baseSeverity[category] || 2;
}

function generateTitle(category) {
  const titles = {
    pothole: "Pothole on road",
    streetlight: "Broken streetlight",
    water_leak: "Water leakage reported",
    garbage: "Garbage/waste accumulation",
    manhole: "Open manhole — danger",
    road_damage: "Road damage reported",
    other: "Civic issue reported"
  };
  return titles[category] || "Issue reported";
}

function getDefaultClassification() {
  return {
    category: "other", categoryLabel: "Other Issue",
    department: "other", severity: 2, confidence: 0,
    suggestedTitle: "Civic issue reported", labels: []
  };
}
```

---

## SECTION 8: CITIZEN APP — PAGE BY PAGE SPECS

### 8.1 LandingPage.jsx
- Full-screen hero with CivicAI logo, tagline "Report. Verify. Resolve. Together."
- Show a live stats bar: "X issues reported | Y resolved | Z cities" (fetch from Firestore)
- 3 feature cards: Smart Reporting, Community Verified, Real-time Tracking
- CTA buttons: "Get Started" (→ /login) and "See Issues Near You" (→ /home without auth)
- Show a static screenshot/mockup of the map
- Mobile responsive, clean and modern design

### 8.2 LoginPage.jsx
- Clean centered card layout
- "Continue with Google" button (Firebase `signInWithPopup` + `GoogleAuthProvider`)
- Divider "or"
- Email + Password fields with React Hook Form
- "Sign Up" / "Login" toggle tabs
- On sign up: `createUserWithEmailAndPassword`, then create `/users/{uid}` document in Firestore with default values
- On login: `signInWithEmailAndPassword`
- After success: redirect to `/home`
- Show error messages (wrong password, user not found, etc.)
- "Forgot Password" link → `sendPasswordResetEmail`

### 8.3 HomePage.jsx (Main Screen)
This is the most important page. Make it look premium.
- **Full-screen Google Map** using `@react-google-maps/api`
- Issue markers as custom colored pins (color = severity level)
  - Red = Critical (5), Orange = High (4), Yellow = Moderate (3), Green = Low (1-2)
  - Click any marker → open IssueCard popup/drawer
- **Floating top bar:** Search location input + Filter button
- **Filter drawer:** Filter by category (checkboxes), severity (slider), status (chips), date range
- **Floating FAB** (bottom right): Big "+" button with label "Report Issue" → navigates to /report
- **Bottom drawer** (swipe up): Shows list of nearby issues sorted by distance
- **"Near Me" toggle**: Show only issues within 1km radius of user's location
- **Stats ribbon** at top: "X open issues in your area"
- Map loads issues from Firestore in real-time using `onSnapshot()`
- Cluster markers when zoomed out (use MarkerClusterer from `@googlemaps/markerclusterer`)

### 8.4 ReportPage.jsx
Step-by-step wizard with 3 steps:

**Step 1 — Photo**
- Large camera/upload area
- Tap to open device camera or file picker
- Support multiple photos (max 3)
- Show photo preview with remove option
- Convert image to base64 for Vision API
- On photo selected: automatically call Vision API in background
- Show "AI is analyzing your photo..." spinner

**Step 2 — AI Result & Details**
- Show `AIClassifyResult` component:
  - Detected category with icon and confidence badge
  - Severity indicator (color bar)
  - Suggested title (editable)
  - "Change category" option if user disagrees (shows CategorySelector)
- Description textarea (optional, max 500 chars, live char count)
- Severity override slider (1-5) if user wants to change

**Step 3 — Location**
- Auto-detect location using browser Geolocation API
- Show Google Map with draggable pin
- Show detected address below map
- "Use current location" button
- Manual search for address as fallback

**Submit Button:**
- Upload photos to Firebase Storage: `/issues/{uid}/{timestamp}_{index}.jpg`
- Create issue document in Firestore `/issues` collection
- Add timeline event: type "created"
- Update user's `totalReports` count in `/users/{uid}`
- Award 20 civic score points
- Navigate to `/issues/{issueId}` with success toast
- Show "Report submitted! Tracking ID: AHM-XXXX" message

### 8.5 IssueDetailPage.jsx
- Full photo carousel (swipe through photos)
- Issue title, category badge, severity badge, status badge
- Reporter info (avatar, name, "X days ago")
- Address and small embedded map showing location
- **UpvoteButton:** Large upvote button showing count. If user already upvoted, show filled state. Clicking:
  - Increments `upvotes` in Firestore
  - Adds uid to `upvotedBy` array
  - If upvotes reach UPVOTE_THRESHOLD (5): update `isVerified: true`, `status: "verified"`, add timeline event
  - Awards 5 civic points to voter (if issue later gets verified)
  - Prevents double voting (check `upvotedBy` array)
- **Status Timeline:** Vertical timeline showing all events from `/timeline` subcollection
  - Icons for each event type, timestamp, actor name
- **Comments section:** Show comments from `/comments` subcollection, add new comment form (requires auth)
- **Resolution card** (if resolved): Shows resolution note + before/after photos

### 8.6 MyReportsPage.jsx
- List of all issues reported by current user
- Sorted by latest first
- Each row shows: thumbnail, title, category icon, status badge, upvotes, created date
- Tap to go to IssueDetailPage
- Empty state: "You haven't reported any issues yet. Be the first!" + CTA button
- Filter tabs: All | Open | In Progress | Resolved

### 8.7 LeaderboardPage.jsx
- Tabs: "This Week" | "All Time"
- Top 3 highlighted with gold/silver/bronze styling
- Each row: rank number, user avatar, name, civic score, level badge
- Current user highlighted (even if not in top 10)
- Show current user's rank at bottom if not in top 10

### 8.8 ProfilePage.jsx
- User avatar (tap to change photo)
- Display name (editable)
- Civic Score (large number, prominent)
- Level badge with progress bar to next level
- Stats cards: Total Reports | Resolved | Upvotes Given
- Badge grid (earned badges colored, unearned grayed out)
- City/Ward selector
- Notification toggle
- Sign out button

---

## SECTION 9: ADMIN DASHBOARD — PAGE BY PAGE SPECS

### 9.1 Layout
- **Sidebar (desktop):** CivicAI logo, nav links, user info at bottom
- **Top bar:** Page title, search bar, notification bell, user menu
- **Mobile:** Collapsible sidebar with hamburger menu
- Sidebar nav items: Dashboard, Issues, Map View, Analytics, Users, Settings

### 9.2 LoginPage.jsx (Admin)
- Email + password only (no Google sign-in for admin)
- Check user role after login — if not "officer" or "admin", show "Access Denied" and sign out
- Redirect to /dashboard on success

### 9.3 DashboardPage.jsx
**Stats Cards Row (4 cards):**
- Total Issues (all time)
- Open Issues (status = open or verified)
- Resolved This Month
- Avg. Resolution Time (days)

**Charts Row:**
- Line chart: Issues reported per day (last 30 days) — Recharts LineChart
- Pie chart: Issues by category — Recharts PieChart with ISSUE_CATEGORIES colors

**Recent Issues Feed:**
- Last 10 issues with: thumbnail, title, status badge, severity, time ago, quick "Assign" button
- Click to go to issue detail

**Leaderboard Sidebar:**
- Top 5 citizens this week

### 9.4 IssuesPage.jsx
- Full data table with all issues
- Columns: #, Photo, Title, Category, Severity, Status, Ward, Reporter, Date, Actions
- Actions column: View, Update Status, Assign Dept buttons
- **Filters bar:** Status chips (All | Open | Verified | In Progress | Resolved), Category dropdown, Severity range, Ward dropdown, Date range picker
- **Sort:** By date, severity, upvotes
- Pagination (20 per page)
- Bulk select + bulk status update
- **StatusUpdateModal:** 
  - Dropdown: select new status
  - Textarea: resolution note (required if resolving)
  - File upload: resolution photo (optional)
  - Submit → update Firestore, add timeline event, show toast

### 9.5 Admin IssueDetailPage.jsx
- All the same info as citizen view PLUS:
- **Admin Actions panel** (right sidebar or bottom section):
  - "Update Status" dropdown with all status options
  - "Assign Department" dropdown
  - "Resolution Note" textarea
  - "Upload Resolution Photo" file input
  - "Mark as Duplicate of:" issue ID input
  - Save Changes button
- Full timeline with all events
- All comments visible

### 9.6 MapPage.jsx (Admin)
- Full-screen Google Map (same as citizen but wider)
- All issue markers visible
- **Heatmap toggle:** Use Google Maps Heatmap layer with issue coordinates weighted by severity
- Filter sidebar: category, status, date range, ward
- Click marker → issue detail slide-over panel

### 9.7 AnalyticsPage.jsx
Charts using Recharts:
- **Resolution Rate Over Time:** AreaChart showing resolved vs new issues per week
- **Issues by Category:** BarChart horizontal
- **Average Resolution Time by Department:** BarChart
- **Issues by Ward:** BarChart (top 10 wards)
- **Severity Distribution:** Donut chart
- **Monthly Trend:** LineChart with dual axis (reported vs resolved)

Export buttons: "Export as CSV" (client-side using papaparse), "Export as PDF" (window.print() with print CSS)

### 9.8 UsersPage.jsx
- Table of all users
- Columns: Avatar, Name, Email, Role, Civic Score, Total Reports, Joined Date, Actions
- Actions: Change Role dropdown (citizen/moderator/officer/admin)
- Filter by role
- Search by name/email

---

## SECTION 10: SHARED COMPONENTS SPECS

### IssueStatusBadge.jsx
```
Pill badge showing status with color from ISSUE_STATUSES constant
Props: status (string)
```

### IssueCard.jsx
```
Card component for issue list views
Props: issue object, showDistance (bool), onClick handler
Shows: thumbnail, title, category icon+label, status badge, severity dot, upvote count, address, time ago
```

### UpvoteButton.jsx
```
Props: issueId, currentUpvotes, upvotedBy array, disabled
Shows: upward arrow icon + count
Active state when user has upvoted (filled color)
Loading state during Firestore update
Prevents action if not authenticated (show login prompt)
```

### PhotoUpload.jsx
```
Drag-drop or click-to-upload area
Accepts: image/jpeg, image/png, image/webp
Max size: 10MB per file, max 3 files
Shows preview thumbnails with remove button
Returns: File array to parent via onChange callback
```

### AIClassifyResult.jsx
```
Card showing AI classification result
Props: classification object from classifyIssue.js
Shows:
  - Category with icon and color
  - Confidence percentage badge (green if >70%, yellow if 50-70%, gray if <50%)
  - Severity bar (colored based on level)
  - "AI suggests: [title]" with edit pencil icon
  - "Change category" text button
If confidence is 0 (no API key or failed): show "Manual classification required" message
```

### IssueTimeline.jsx
```
Vertical timeline of events from /timeline subcollection
Each event: colored dot, event description, actor name, timestamp
Event type icons: flag (created), check (verified), user (assigned), wrench (in_progress), checkCircle (resolved), xCircle (rejected)
```

---

## SECTION 11: HOOKS

### useAuth.js
```javascript
// Returns: { user, userProfile, loading, signInWithGoogle, signInWithEmail, signUp, signOut }
// Subscribes to onAuthStateChanged
// Fetches /users/{uid} document when auth state changes
// Creates user document on first login if it doesn't exist
```

### useIssues.js
```javascript
// Returns paginated issues from Firestore
// Accepts: filters object { category, status, ward, severity, city }
// Uses onSnapshot for real-time updates
// Returns: { issues, loading, error, hasMore, loadMore }
```

### useGeolocation.js
```javascript
// Returns: { location: {lat, lng}, address, loading, error, requestPermission }
// Uses navigator.geolocation.getCurrentPosition
// Reverse geocodes using Google Maps Geocoding API
```

### useUpvote.js
```javascript
// Returns: { upvote, hasUpvoted, loading }
// Checks if current user has upvoted the issue
// Handles Firestore transaction for atomic upvote
// Checks if upvote threshold reached → updates isVerified
// Awards civic points
```

---

## SECTION 12: FIREBASE CONFIG

### `shared/firebase.js`
```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = isSupported().then(yes => yes ? getMessaging(app) : null);
```

---

## SECTION 13: REAL-TIME UPVOTE → AUTO-VERIFY LOGIC

Since there are no Cloud Functions, handle this client-side in `useUpvote.js`:

```javascript
import { doc, updateDoc, arrayUnion, increment, runTransaction } from "firebase/firestore";
import { db } from "../shared/firebase.js";
import { UPVOTE_THRESHOLD } from "../shared/constants.js";

export async function handleUpvote(issueId, userId, currentUpvotes, upvotedBy) {
  if (upvotedBy.includes(userId)) return; // already voted
  
  const issueRef = doc(db, "issues", issueId);
  const userRef = doc(db, "users", userId);
  
  await runTransaction(db, async (transaction) => {
    const issueDoc = await transaction.get(issueRef);
    const newUpvotes = issueDoc.data().upvotes + 1;
    const shouldVerify = newUpvotes >= UPVOTE_THRESHOLD && !issueDoc.data().isVerified;
    
    transaction.update(issueRef, {
      upvotes: increment(1),
      upvotedBy: arrayUnion(userId),
      ...(shouldVerify && {
        isVerified: true,
        status: "verified",
        updatedAt: new Date()
      })
    });
    
    if (shouldVerify) {
      // Add timeline event
      const timelineRef = doc(collection(db, "issues", issueId, "timeline"));
      transaction.set(timelineRef, {
        type: "verified",
        description: "Community verified — reached 5 upvotes",
        actorId: "system",
        actorName: "Community",
        newStatus: "verified",
        createdAt: new Date()
      });
    }
  });
}
```

---

## SECTION 14: CIVIC SCORE SYSTEM — CLIENT-SIDE

Since there are no Cloud Functions, civic score is updated client-side at key events:

```javascript
// In shared/firestore.js
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "./firebase.js";
import { CIVIC_SCORE_EVENTS, LEVEL_THRESHOLDS, BADGES } from "./constants.js";

export async function awardCivicPoints(userId, eventType) {
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
```

---

## SECTION 15: DESIGN SYSTEM

### Colors
```css
--primary: #1A56DB;        /* Civic Blue */
--primary-dark: #1E429F;   /* Deep Navy */
--success: #16A34A;        /* Verified Green */
--warning: #D97706;        /* Alert Amber */
--danger: #DC2626;         /* Critical Red */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-600: #4B5563;
--gray-900: #111827;
```

### Tailwind Config Extensions
```javascript
// In tailwind.config.js for both apps
theme: {
  extend: {
    colors: {
      primary: { DEFAULT: "#1A56DB", dark: "#1E429F", light: "#EBF5FF" },
      civic: { green: "#16A34A", amber: "#D97706", red: "#DC2626" }
    },
    fontFamily: { sans: ["Inter", "sans-serif"] }
  }
}
```

### Typography
- Font: Inter (load from Google Fonts)
- Headings: font-semibold
- Body: font-normal, text-gray-700
- Muted: text-gray-500

### Spacing & Borders
- Cards: rounded-2xl, shadow-sm, border border-gray-100
- Buttons: rounded-xl
- Inputs: rounded-lg, border-gray-300
- Mobile screen padding: px-4

---

## SECTION 16: MOBILE-FIRST RESPONSIVE RULES

- All citizen app pages: max-width none (full screen)
- Bottom navigation on mobile (< md breakpoint), top nav on desktop
- Map takes full viewport height on mobile: `h-[calc(100vh-64px)]`
- Modals/drawers from bottom on mobile (sheet pattern)
- Admin dashboard: sidebar hidden on mobile, hamburger menu shown
- Minimum tap target: 44px × 44px for all buttons

---

## SECTION 17: NOTIFICATIONS — FCM WEB PUSH

### `shared/notifications.js`
```javascript
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase.js";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase.js";

export async function setupPushNotifications(userId) {
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
      // Show in-app toast notification
      toast(payload.notification?.body || "Issue update", { icon: "🔔" });
    });
  } catch (e) {
    console.warn("Push notification setup failed:", e);
  }
}
```

> Note: Since there are no Cloud Functions to send FCM messages server-side, push notifications will work for foreground messages. For status update notifications, show in-app toasts triggered by Firestore real-time listeners instead. This is sufficient for the hackathon demo.

---

## SECTION 18: ISSUE TRACKING ID GENERATION

Generate human-readable tracking IDs client-side:

```javascript
// In shared/firestore.js
export function generateTrackingId(city = "AHM") {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `${city.toUpperCase()}-${year}-${random}`;
}
```

Add `trackingId` field to issue document on creation.

---

## SECTION 19: FIREBASE HOSTING CONFIG

### `firebase.json`
```json
{
  "hosting": [
    {
      "target": "app",
      "public": "app/dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    },
    {
      "target": "admin",
      "public": "admin/dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    }
  ]
}
```

### `.firebaserc`
```json
{
  "projects": { "default": "YOUR_PROJECT_ID" },
  "targets": {
    "YOUR_PROJECT_ID": {
      "hosting": {
        "app": ["YOUR_APP_SITE_ID"],
        "admin": ["YOUR_ADMIN_SITE_ID"]
      }
    }
  }
}
```

---

## SECTION 20: PACKAGE.JSON SCRIPTS

### Root `package.json`
```json
{
  "name": "civicai",
  "private": true,
  "workspaces": ["app", "admin"],
  "scripts": {
    "dev:app": "npm -w app run dev",
    "dev:admin": "npm -w admin run dev",
    "build:app": "npm -w app run build",
    "build:admin": "npm -w admin run build",
    "build": "npm run build:app && npm run build:admin",
    "deploy": "npm run build && firebase deploy --only hosting"
  }
}
```

---

## SECTION 21: SEED DATA SCRIPT

Create `scripts/seedData.js` that populates Firestore with demo data:
- 3 demo users (1 citizen, 1 moderator, 1 officer)
- 15 demo issues across different categories and statuses in Ahmedabad
- Issues spread across different wards
- Some with upvotes, some resolved, some in progress
- Timeline events for each issue

This makes the demo look realistic immediately.

---

## SECTION 22: DEMO ACCOUNTS

Create these accounts in Firebase Auth and seed as users:
```
Citizen: demo@civicai.app / Demo@1234
Officer: officer@civicai.app / Officer@1234
Admin: admin@civicai.app / Admin@1234
```

---

## SECTION 23: README.md

Write a complete README with:
- Project description and screenshots section (placeholder)
- Prerequisites (Node 18+, Firebase CLI, Google Cloud account)
- Step-by-step setup: Firebase project creation, enabling services, API keys
- `.env.example` with all required variables
- `npm run dev:app` and `npm run dev:admin` to run locally
- How to deploy to Firebase Hosting
- How to set up Google Sign-In in Firebase Console
- How to enable Google Cloud Vision API
- Architecture diagram (text-based)
- Tech stack list

---

## SECTION 24: FINAL CHECKLIST FOR AGENT

Before considering the build complete, verify:

- [ ] Both apps start with `npm run dev` without errors
- [ ] Google Sign-In works end-to-end
- [ ] Email/Password sign up and login works
- [ ] Citizen can submit a report with photo
- [ ] AI classification runs (or gracefully falls back to manual selection)
- [ ] Issue appears on map immediately after submission
- [ ] Upvoting works and auto-verifies at 5 votes
- [ ] Issue status timeline shows correctly
- [ ] Admin can log in and see all issues
- [ ] Admin can update issue status
- [ ] Admin dashboard charts render with seed data
- [ ] Mobile layout is correct on 375px viewport
- [ ] All routes are protected (auth guard on citizen private pages)
- [ ] Admin routes check for officer/admin role
- [ ] Firebase Security Rules are deployed
- [ ] No console errors in production build
- [ ] `.env.example` file is present
- [ ] README has complete setup instructions

---

## END OF BUILD PROMPT

Build this complete project now. Start with the shared folder, then the citizen app, then the admin dashboard. Do not stop until all sections are implemented. If you encounter an ambiguity, make the most reasonable decision and continue.
