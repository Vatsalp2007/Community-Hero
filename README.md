# CivicAI

**Report. Verify. Resolve. Together.**

AI-powered hyperlocal civic issue reporting and resolution platform. Citizens report infrastructure issues with photos, AI auto-classifies them, the community verifies, and municipal officers resolve — with full real-time transparency.

## Architecture

```
civicai/
├── shared/        # Firebase config, types, utilities (shared between apps)
├── app/           # Citizen-facing React web app (mobile-first)
├── admin/         # Municipal officer/admin dashboard (desktop-first)
├── scripts/       # Seed data and utilities
└── firebase.json  # Firebase hosting config
```

## Tech Stack

- **Frontend:** React 18 + Vite, Tailwind CSS, Zustand, React Query
- **Backend:** Firebase (Auth, Firestore, Storage, Hosting)
- **AI:** Google Cloud Vision API (client-side)
- **Maps:** Google Maps API
- **Charts:** Recharts

## Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud account with Vision API enabled
- Firebase project with Auth, Firestore, Storage enabled

## Setup

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd civicai
   npm install
   ```

2. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Authentication (Email/Password + Google)
   - Enable Cloud Firestore
   - Enable Firebase Storage

3. **Create `.env` file in root:**
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

4. **Get API Keys:**
   - **Google Maps:** [Google Cloud Console](https://console.cloud.google.com) → APIs → Maps JavaScript API
   - **Vision API:** Google Cloud Console → APIs → Cloud Vision API → Enable

5. **Update `.firebaserc`:**
   Replace `YOUR_PROJECT_ID` with your Firebase project ID.

6. **Run locally:**
   ```bash
   # Citizen app (port 3000)
   npm run dev:app

   # Admin dashboard (port 3001)
   npm run dev:admin
   ```

7. **Seed demo data:**
   ```bash
   # Create demo accounts in Firebase Auth first, then:
   node scripts/seedData.js
   ```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Citizen | demo@civicai.app | Demo@1234 |
| Officer | officer@civicai.app | Officer@1234 |
| Admin | admin@civicai.app | Admin@1234 |

## Deployment

```bash
# Build both apps
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## Firebase Security Rules

Security rules are in `firestore.rules` and `storage.rules`. Deploy them via:
```bash
firebase deploy --only firestore:rules,storage
```

## Features

### Citizen App
- Interactive map with real-time issue markers
- AI-powered photo classification
- Community upvote verification system
- Issue tracking with timeline
- Gamification (civic score, badges, leaderboard)
- Mobile-first responsive design

### Admin Dashboard
- Overview statistics and charts
- Issue queue management with filters
- Status updates and department assignment
- User management with role-based access
- Analytics with CSV export
- Map heatmap view

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key |
| `VITE_VISION_API_KEY` | Google Cloud Vision API key |
