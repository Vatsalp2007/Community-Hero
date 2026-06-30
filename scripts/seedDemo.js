const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccount.json');

// Initialize with service account
const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'civicai-v2-2026.firebasestorage.app'
});

const auth = getAuth(app);
const db = getFirestore(app);
db.settings({ ignoreUndefinedProperties: true });

const DEMO_USERS = [
  { email: 'demo@jansetu.app', password: 'Demo@1234', displayName: 'Rahul Sharma', role: 'citizen', civicScore: 350, level: 'gold', totalReports: 8, totalResolved: 3 },
  { email: 'officer@jansetu.app', password: 'Officer@1234', displayName: 'Priya Patel', role: 'officer', civicScore: 100, level: 'silver', totalReports: 2, totalResolved: 0 },
  { email: 'admin@jansetu.app', password: 'Admin@1234', displayName: 'Amit Joshi', role: 'admin', civicScore: 50, level: 'bronze', totalReports: 0, totalResolved: 0 }
];

const WARDS = ['Ward 1 - Navrangpura', 'Ward 2 - Shahibaug', 'Ward 3 - Satellite', 'Ward 4 - Ellis Bridge', 'Ward 5 - Ambawadi'];
const AHMEDABAD_COORDS = [
  { lat: 23.0225, lng: 72.5714 }, { lat: 23.0300, lng: 72.5600 },
  { lat: 23.0150, lng: 72.5800 }, { lat: 23.0350, lng: 72.5650 },
  { lat: 23.0200, lng: 72.5550 }, { lat: 23.0280, lng: 72.5750 },
  { lat: 23.0180, lng: 72.5680 }, { lat: 23.0320, lng: 72.5620 },
  { lat: 23.0260, lng: 72.5580 }, { lat: 23.0140, lng: 72.5720 },
  { lat: 23.0380, lng: 72.5690 }, { lat: 23.0240, lng: 72.5770 },
  { lat: 23.0160, lng: 72.5630 }, { lat: 23.0310, lng: 72.5530 },
  { lat: 23.0190, lng: 72.5760 }
];

const DEMO_ISSUES = [
  { category: 'pothole', title: 'Large pothole on Ashram Road', description: 'Deep pothole near bus stop causing traffic jams', severity: 4, status: 'open' },
  { category: 'streetlight', title: 'Broken streetlight in Bopal', description: 'Street light not working for 3 days near school', severity: 3, status: 'verified' },
  { category: 'water_leak', title: 'Water pipe burst in CG Road', description: 'Major water leak flooding the sidewalk', severity: 5, status: 'in_progress', department: 'water' },
  { category: 'garbage', title: 'Garbage dump near Sarkhej', description: 'Overflowing garbage bins attracting stray animals', severity: 3, status: 'open' },
  { category: 'manhole', title: 'Open manhole near SG Highway', description: 'Cover missing, dangerous for pedestrians', severity: 5, status: 'verified' }
];

async function main() {
  console.log('Cleaning up old issues...\n');
  const existingIssues = await db.collection('issues').get();
  const batch = db.batch();
  existingIssues.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log(`  Deleted ${existingIssues.size} old issues\n`);
  
  console.log('Creating demo accounts...\n');
  
  const userUids = [];
  
  for (const userData of DEMO_USERS) {
    try {
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(userData.email);
        console.log(`  User ${userData.email} already exists (${userRecord.uid})`);
      } catch (e) {
        userRecord = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName
        });
        console.log(`  Created user: ${userData.email} (${userData.role})`);
      }
      userUids.push(userRecord.uid);
      
      const departments = { pothole: 'roads', streetlight: 'electricity', water_leak: 'water', garbage: 'sanitation', manhole: 'roads', road_damage: 'roads', other: 'other' };
      
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        displayName: userData.displayName,
        email: userData.email,
        photoURL: null,
        role: userData.role,
        city: 'Ahmedabad',
        ward: WARDS[Math.floor(Math.random() * WARDS.length)],
        civicScore: userData.civicScore,
        level: userData.level,
        badgeIds: userData.civicScore > 200 ? ['first_report', 'century_club'] : ['first_report'],
        totalReports: userData.totalReports,
        totalResolved: userData.totalResolved,
        createdAt: FieldValue.serverTimestamp(),
        fcmToken: null,
        notificationsEnabled: true
      });
      
      console.log(`  Seeded user profile: ${userData.displayName} (${userData.role})`);
    } catch (e) {
      console.log(`  Error with ${userData.email}: ${e.message}`);
    }
  }
  
  console.log('\nCreating demo issues...\n');
  
  const citizenUid = userUids[0];
  
  for (let i = 0; i < DEMO_ISSUES.length; i++) {
    const issueData = DEMO_ISSUES[i];
    const coords = AHMEDABAD_COORDS[i % AHMEDABAD_COORDS.length];
    const ward = WARDS[i % WARDS.length];
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(Date.now() - daysAgo * 86400000);
    const departments = { pothole: 'roads', streetlight: 'electricity', water_leak: 'water', garbage: 'sanitation', manhole: 'roads', road_damage: 'roads', other: 'other' };
    
    const issueDoc = await db.collection('issues').add({
      reportedBy: citizenUid,
      reporterName: 'Rahul Sharma',
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
      city: 'Ahmedabad',
      mediaUrls: [],
      thumbnailUrl: '',
      aiClassification: { labels: [issueData.category], confidence: 75 + Math.floor(Math.random() * 20), rawResponse: {} },
      upvotes: Math.floor(Math.random() * 12),
      upvotedBy: [],
      verifiedBy: [],
      isVerified: issueData.status === 'verified',
      duplicateOf: null,
      assignedDept: issueData.department || '',
      assignedAt: ['assigned', 'in_progress', 'resolved'].includes(issueData.status) ? Timestamp.fromDate(createdAt) : null,
      resolvedAt: issueData.status === 'resolved' ? FieldValue.serverTimestamp() : null,
      resolvedBy: issueData.status === 'resolved' ? 'officer' : null,
      resolutionNote: issueData.status === 'resolved' ? 'Issue has been fixed.' : null,
      resolutionPhotoUrl: null,
      rejectionReason: null,
      geohash: '',
      trackingId: `AHM-2026-${10000 + i}`,
      createdAt: Timestamp.fromDate(createdAt),
      updatedAt: FieldValue.serverTimestamp()
    });
    
    await issueDoc.collection('timeline').add({
      type: 'created',
      description: 'Issue reported',
      actorId: citizenUid,
      actorName: 'Rahul Sharma',
      newStatus: 'open',
      createdAt: Timestamp.fromDate(createdAt)
    });
    
    if (issueData.status === 'verified') {
      await issueDoc.collection('timeline').add({
        type: 'verified',
        description: 'Community verified - reached 5 upvotes',
        actorId: 'system',
        actorName: 'Community',
        newStatus: 'verified',
        createdAt: Timestamp.fromDate(new Date(createdAt.getTime() + 86400000))
      });
    }
    
    if (['in_progress', 'resolved'].includes(issueData.status)) {
      await issueDoc.collection('timeline').add({
        type: 'assigned',
        description: `Assigned to ${departments[issueData.category]} department`,
        actorId: 'system',
        actorName: 'System',
        newStatus: 'assigned',
        createdAt: Timestamp.fromDate(new Date(createdAt.getTime() + 172800000))
      });
    }
    
    if (issueData.status === 'resolved') {
      await issueDoc.collection('timeline').add({
        type: 'resolved',
        description: 'Issue resolved',
        actorId: 'officer',
        actorName: 'Priya Patel',
        newStatus: 'resolved',
        createdAt: Timestamp.fromDate(new Date())
      });
    }
    
    console.log(`  Created: ${issueData.title}`);
  }
  
  console.log('\n=== Seeding complete! ===');
  console.log('\nDemo Accounts:');
  DEMO_USERS.forEach(u => console.log(`  ${u.role}: ${u.email} / ${u.password}`));
  console.log('\nCitizen App: http://localhost:3000');
  console.log('Admin Dashboard: http://localhost:3001');
  
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
