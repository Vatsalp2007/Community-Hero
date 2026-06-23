import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { signOut as authSignOut } from '@shared/auth.js';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import BadgeGrid from '../components/gamification/BadgeGrid';
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
  const scoreToGold = 500;
  const progressPercent = Math.min((civicScore / scoreToGold) * 100, 100);
  const level = civicScore >= 400 ? 'Gold' : civicScore >= 200 ? 'Silver' : 'Bronze';

  return (
    <div className="min-h-screen bg-background pb-20" style={{ backgroundImage: 'radial-gradient(at 0% 0%, rgba(26,86,219,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(6,182,212,0.05) 0px, transparent 50%)' }}>
      <div className="pt-24 pb-4 px-gutter max-w-container-max mx-auto">
        <div className="mb-xl">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Citizen Profile</h1>
          <p className="text-on-surface-variant font-body-md mt-xs">Your civic impact and community contributions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
          {/* Left Column */}
          <div className="lg:col-span-4 flex flex-col gap-lg">
            {/* Profile Identity Card */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl p-lg flex flex-col items-center text-center shadow-sm">
              <div className="relative mb-md">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] flex items-center justify-center text-white text-[48px] font-extrabold border-4 border-white shadow-xl overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <div className="absolute bottom-1 right-1 bg-white p-base rounded-full shadow-md">
                  <span className="material-symbols-outlined text-primary text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              </div>

              {editing ? (
                <div className="flex items-center gap-2 w-full">
                  <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 px-3 py-1.5 rounded-lg text-body-md bg-white/80 border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <button onClick={handleSaveName} className="px-3 py-1.5 text-white text-sm rounded-lg bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] transition-all active:scale-95">Save</button>
                  <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-on-surface-variant text-sm transition-all active:scale-95">Cancel</button>
                </div>
              ) : (
                <>
                  <h2 className="font-headline-md text-headline-md text-on-surface">{userProfile?.displayName || user?.displayName || 'User'}</h2>
                  <p className="text-on-surface-variant font-body-md">{user?.email}</p>
                  <div className="mt-lg w-full flex flex-col gap-xs">
                    <button onClick={() => setEditing(true)} className="bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white py-sm px-md rounded-lg font-label-md transition-all active:scale-95 shadow-lg shadow-primary/20">
                      Edit Profile
                    </button>
                    <button className="bg-surface-container-low text-on-surface py-sm px-md rounded-lg font-label-md transition-all hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center gap-xs">
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      Share Public Profile
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-md">
              <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl p-md text-center shadow-sm">
                <div className="font-headline-md text-headline-md text-primary">{userProfile?.totalReports || 0}</div>
                <div className="font-label-md text-[10px] uppercase tracking-wider text-on-surface-variant">Reports</div>
              </div>
              <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl p-md text-center shadow-sm">
                <div className="font-headline-md text-headline-md text-secondary">{userProfile?.totalResolved || 0}</div>
                <div className="font-label-md text-[10px] uppercase tracking-wider text-on-surface-variant">Resolved</div>
              </div>
              <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl p-md text-center shadow-sm">
                <div className="font-headline-md text-headline-md text-tertiary capitalize">{level}</div>
                <div className="font-label-md text-[10px] uppercase tracking-wider text-on-surface-variant">Level</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 flex flex-col gap-lg">
            {/* Civic Score Hero */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl p-lg overflow-hidden relative shadow-sm">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="flex justify-between items-start mb-lg relative z-10">
                <div>
                  <div className="flex items-center gap-xs font-label-md text-on-surface-variant mb-xs">
                    <span className="material-symbols-outlined text-body-md">stars</span>
                    Civic Score
                  </div>
                  <div className="font-display-lg text-display-lg text-on-surface leading-tight" style={{ background: 'linear-gradient(135deg, #1A56DB, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {civicScore}
                  </div>
                </div>
                <span className="bg-surface-container-highest text-primary font-label-md px-md py-xs rounded-full border border-primary/20 capitalize">
                  {level} Tier
                </span>
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-end font-label-md text-on-surface-variant mb-sm">
                  <span className="text-[12px] uppercase font-bold tracking-widest">{level}</span>
                  <span className="text-[12px] uppercase font-bold tracking-widest opacity-50">Gold</span>
                </div>
                <div className="w-full h-4 bg-surface-container-high rounded-full overflow-hidden p-[2px] border border-white/50">
                  <div className="h-full bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="mt-md flex items-center gap-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-body-md">trending_up</span>
                  <span className="font-body-md"><strong>{scoreToGold - civicScore}</strong> points to reach <span className="text-tertiary font-bold">Gold Tier</span></span>
                </div>
              </div>
            </div>

            {/* Badges Section */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl p-lg shadow-sm">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="font-headline-md text-headline-md text-on-surface">Unlocked Badges</h3>
                <a className="text-primary font-label-md hover:underline cursor-pointer">View All Gallery</a>
              </div>
              <BadgeGrid earnedBadgeIds={userProfile?.badgeIds || []} />
            </div>

            {/* Sign Out */}
            <button onClick={handleSignOut} className="w-full bg-white/40 border border-error/20 hover:bg-error/5 text-error rounded-xl p-md flex items-center justify-center gap-sm transition-all font-label-md group">
              <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
