const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccount.json');

const KEEP_EMAILS = ['vatsalp.dev06@gmail.com', 'panchasarav2007@gmail.com'];

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'civicai-v2-2026.firebasestorage.app'
});

const auth = getAuth(app);
const db = getFirestore(app);
db.settings({ ignoreUndefinedProperties: true });

async function main() {
  console.log('=== Firebase User Cleanup ===\n');

  // Step 1: List all users
  console.log('Fetching all auth users...');
  const allUsers = [];
  let pageToken;
  do {
    const result = await auth.listUsers(1000, pageToken);
    allUsers.push(...result.users);
    pageToken = result.pageToken;
  } while (pageToken);
  console.log(`Total auth users found: ${allUsers.length}\n`);

  // Step 2: Delete all users except the two we want to keep
  const toDelete = allUsers.filter(u => !KEEP_EMAILS.includes(u.email));
  const toKeep = allUsers.filter(u => KEEP_EMAILS.includes(u.email));

  console.log(`Keeping users:`);
  for (const u of toKeep) {
    console.log(`  ✅ ${u.email} (${u.uid})`);
  }

  console.log(`\nDeleting ${toDelete.length} users...`);
  for (const u of toDelete) {
    try {
      await auth.deleteUser(u.uid);
      console.log(`  🗑️ Deleted: ${u.email} (${u.uid})`);

      // Also delete their Firestore profile if it exists
      try {
        await db.collection('users').doc(u.uid).delete();
      } catch (e) { /* ignore */ }
    } catch (e) {
      console.log(`  ❌ Failed to delete ${u.email}: ${e.message}`);
    }
  }

  // Step 3: Ensure the two users exist and set correct roles
  console.log('\n=== Setting up user profiles ===\n');

  const userConfigs = [
    { email: 'vatsalp.dev06@gmail.com', displayName: 'Vatsal P', role: 'admin', city: 'Ahmedabad' },
    { email: 'panchasarav2007@gmail.com', displayName: 'Panchasar AV', role: 'citizen', city: 'Ahmedabad' },
  ];

  for (const cfg of userConfigs) {
    let uid;
    try {
      // Check if user exists in Auth
      const userRecord = await auth.getUserByEmail(cfg.email);
      uid = userRecord.uid;
      console.log(`  ✅ Auth user exists: ${cfg.email} (${uid})`);
    } catch (e) {
      // Create the user if they don't exist
      try {
        const userRecord = await auth.createUser({
          email: cfg.email,
          displayName: cfg.displayName,
        });
        uid = userRecord.uid;
        console.log(`  ✅ Created auth user: ${cfg.email} (${uid})`);
      } catch (e2) {
        console.log(`  ❌ Failed to create ${cfg.email}: ${e2.message}`);
        continue;
      }
    }

    // Set Firestore profile with correct role
    await db.collection('users').doc(uid).set({
      uid,
      displayName: cfg.displayName,
      email: cfg.email,
      photoURL: null,
      role: cfg.role,
      city: cfg.city,
      ward: 'Ward 1 - Navrangpura',
      civicScore: cfg.role === 'admin' ? 0 : 350,
      level: cfg.role === 'admin' ? 'bronze' : 'gold',
      badgeIds: cfg.role === 'citizen' ? ['first_report', 'century_club'] : [],
      totalReports: cfg.role === 'citizen' ? 8 : 0,
      totalResolved: cfg.role === 'citizen' ? 3 : 0,
      createdAt: FieldValue.serverTimestamp(),
      fcmToken: null,
      notificationsEnabled: true
    }, { merge: true });
    console.log(`  ✅ Firestore profile updated: ${cfg.email} → role: ${cfg.role}`);
  }

  console.log('\n=== Done! ===');
  console.log('\nUpdated users:');
  console.log('  Admin : vatsalp.dev06@gmail.com');
  console.log('  Citizen: panchasarav2007@gmail.com');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
