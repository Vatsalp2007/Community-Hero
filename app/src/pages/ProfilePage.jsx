import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { signOut as authSignOut } from '@shared/auth.js';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { calculateLevel } from '@shared/firestore.js';
import { LEVEL_THRESHOLDS } from '@shared/constants.js';
import BadgeGrid from '../components/gamification/BadgeGrid';
import GamificationGuide from '../components/gamification/GamificationGuide';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, userProfile, setUserProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userProfile?.displayName || '');

  const handleSignOut = async () => {
    await authSignOut();
    navigate('/');
  };

  const handleSaveName = async () => {
    if (!user || !name.trim()) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { displayName: name.trim() });
      setUserProfile({ ...userProfile, displayName: name.trim() });
      setEditing(false);
      toast.success('Name updated');
    } catch (e) {
      toast.error('Failed to update name');
    }
  };

  const civicScore = userProfile?.civicScore || 0;
  const level = calculateLevel(civicScore);
  const levels = Object.entries(LEVEL_THRESHOLDS);
  const currentIdx = levels.findIndex(([l]) => l === level);
  const nextLevel = currentIdx < levels.length - 1 ? levels[currentIdx + 1] : null;
  const nextLevelName = nextLevel ? nextLevel[0] : null;
  const nextLevelScore = nextLevel ? nextLevel[1] : null;
  const progressPercent = nextLevel ? Math.min(((civicScore - levels[currentIdx][1]) / (nextLevel[1] - levels[currentIdx][1])) * 100, 100) : 100;
  const pointsToNext = nextLevel ? nextLevelScore - civicScore : 0;

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <div className="pt-24 pb-4 px-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white/90">Citizen Profile</h1>
          <p className="text-sm text-white/60 mt-1">Your civic impact and community contributions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Profile Identity Card */}
            <div className="bg-white/20 backdrop-blur-xl border border-white/10 rounded-xl p-5 flex flex-col items-center text-center shadow-sm">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] flex items-center justify-center text-white text-[48px] font-extrabold border-4 border-white/20 shadow-xl overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <div className="absolute bottom-1 right-1 bg-white/20 backdrop-blur-sm rounded-full p-1.5 shadow-md">
                  <span className="material-symbols-outlined text-cyan-300 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              </div>

              {editing ? (
                <div className="flex flex-col gap-2 w-full">
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/40" />
                  <div className="flex gap-2">
                    <button onClick={handleSaveName} className="flex-1 px-3 py-2 text-white text-sm font-medium rounded-lg bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] transition-all active:scale-95">Save</button>
                    <button onClick={() => setEditing(false)} className="flex-1 px-3 py-2 text-white/70 text-sm font-medium rounded-lg bg-white/10 border border-white/10 transition-all active:scale-95 hover:bg-white/20">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-base font-bold text-white/90">{userProfile?.displayName || user?.displayName || 'User'}</h2>
                  <p className="text-sm text-white/50">{user?.email}</p>
                  <div className="mt-4 w-full flex flex-col gap-1.5">
                    <button onClick={() => setEditing(true)} className="bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white py-2 px-4 rounded-lg text-sm font-medium transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                      Edit Profile
                    </button>
                    <button className="bg-white/10 text-white/70 py-2 px-4 rounded-lg text-sm font-medium transition-all hover:bg-white/20 border border-white/10 flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      Share Public Profile
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/20 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-center shadow-sm">
                <div className="text-lg font-bold text-blue-300">{userProfile?.totalReports || 0}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/50">Reports</div>
              </div>
              <div className="bg-white/20 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-center shadow-sm">
                <div className="text-lg font-bold text-teal-300">{userProfile?.totalResolved || 0}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/50">Resolved</div>
              </div>
              <div className="bg-white/20 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-center shadow-sm">
                <div className="text-lg font-bold text-orange-300 capitalize">{level}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/50">Level</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Civic Score Hero */}
            <div className="bg-white/20 backdrop-blur-xl border border-white/10 rounded-xl p-5 overflow-hidden relative shadow-sm">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <div className="flex items-center gap-1 text-xs text-white/50 mb-1">
                    <span className="material-symbols-outlined text-base">stars</span>
                    Civic Score
                  </div>
                  <div className="text-4xl font-bold leading-tight" style={{ background: 'linear-gradient(135deg, #1A56DB, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {civicScore}
                  </div>
                </div>
                <span className="bg-white/10 text-cyan-300 text-xs font-medium px-3 py-1 rounded-full border border-white/10 capitalize">
                  {level} Tier
                </span>
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-end text-xs text-white/50 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest capitalize">{level}</span>
                  {nextLevelName && <span className="text-[10px] uppercase font-bold tracking-widest opacity-50 capitalize">{nextLevelName}</span>}
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-[2px] border border-white/5">
                  <div className="h-full bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="mt-3 flex items-center gap-1 text-white/50 text-xs">
                  <span className="material-symbols-outlined text-base">trending_up</span>
                  {nextLevel ? (
                    <span><strong className="text-white/80">{pointsToNext}</strong> points to <span className="text-yellow-300 font-bold capitalize">{nextLevelName} Tier</span></span>
                  ) : (
                    <span><strong className="text-white/80">Max level reached!</strong></span>
                  )}
                </div>
              </div>
            </div>

            {/* Badges Section */}
            <div className="bg-white/20 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-white/90">Unlocked Badges</h3>
                <a className="text-cyan-300 text-xs font-medium hover:underline cursor-pointer">View All Gallery</a>
              </div>
              <BadgeGrid earnedBadgeIds={userProfile?.badgeIds || []} />
            </div>

            {/* How Scoring Works */}
            <GamificationGuide userScore={civicScore} />

            {/* Sign Out */}
            <button onClick={handleSignOut} className="w-full bg-white/10 border border-red-400/20 hover:bg-red-500/10 text-red-300 rounded-xl p-3 flex items-center justify-center gap-2 transition-all text-sm font-medium group">
              <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
