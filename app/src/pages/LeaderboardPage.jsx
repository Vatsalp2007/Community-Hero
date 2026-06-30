import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { useAuth } from '../hooks/useAuth';
import GamificationGuide from '../components/gamification/GamificationGuide';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weekly');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('civicScore', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <div className="pt-24 pb-4 px-6 max-w-4xl mx-auto">
        {/* Header & Filter */}
        <section className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white/90 mb-1">City Contributors</h1>
            <p className="text-sm text-white/60 max-w-2xl">Honoring the citizens who make our community safer and more vibrant through active engagement and reporting.</p>
          </div>
          <div className="flex p-1 bg-white/10 rounded-xl">
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'weekly' ? 'bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white shadow-md' : 'text-white/60 hover:bg-white/10'}`}
            >
              This Week
            </button>
            <button
              onClick={() => setActiveTab('alltime')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'alltime' ? 'bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white shadow-md' : 'text-white/60 hover:bg-white/10'}`}
            >
              All Time
            </button>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
          </div>
        ) : (
          <>
            {/* Podium Section (Top 3) */}
            {top3.length >= 3 && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20 items-end">
                {/* Rank 2 */}
                <div className="order-2 md:order-1 flex flex-col items-center group">
                  <div className="bg-white/20 backdrop-blur-xl border border-white/10 p-5 rounded-2xl w-full text-center shadow-lg transition-transform duration-300 group-hover:-translate-y-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/40" />
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-cyan-400/30 shadow-lg bg-cyan-400/10 flex items-center justify-center text-2xl font-bold text-cyan-300">
                        {top3[1]?.photoURL ? <img src={top3[1].photoURL} alt="" className="w-full h-full object-cover" /> : getInitials(top3[1]?.displayName)}
                      </div>
                      <div className="absolute -bottom-2 right-0 bg-cyan-400/80 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">2</div>
                    </div>
                    <h3 className="text-base font-semibold text-white/90">{top3[1]?.displayName || top3[1]?.displayName || 'Anonymous'}</h3>
                    <p className="text-xs text-cyan-300 mb-2">Silver Level</p>
                    <div className="py-1 px-3 bg-cyan-400/10 rounded-full inline-block">
                      <span className="font-bold text-cyan-300 text-sm">{top3[1]?.civicScore || 0} points</span>
                    </div>
                  </div>
                  <div className="hidden md:block w-full h-16 bg-white/5 rounded-t-xl mt-4 opacity-50" />
                </div>

                {/* Rank 1 */}
                <div className="order-1 md:order-2 flex flex-col items-center group z-10">
                  <div className="bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] p-[1px] rounded-3xl w-full shadow-2xl transition-transform duration-300 group-hover:-translate-y-4">
                    <div className="bg-slate-900 backdrop-blur-xl rounded-[23px] w-full text-center relative overflow-hidden p-6">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-cyan-400 shadow-2xl bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] flex items-center justify-center text-3xl font-bold text-white">
                          {top3[0]?.photoURL ? <img src={top3[0].photoURL} alt="" className="w-full h-full object-cover" /> : getInitials(top3[0]?.displayName)}
                        </div>
                        <div className="absolute -bottom-2 right-2 bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ring-4 ring-slate-900">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <h3 className="text-lg font-bold text-white/90">{top3[0]?.displayName || 'Anonymous'}</h3>
                        {user?.uid === top3[0]?.id && <span className="text-cyan-300 font-bold text-sm">(You)</span>}
                      </div>
                      <p className="text-xs text-cyan-300 mb-3">Gold Level</p>
                      <div className="py-2 px-5 bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white rounded-full inline-block shadow-lg">
                        <span className="font-bold text-base">{top3[0]?.civicScore || 0} points</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block w-full h-32 bg-white/5 rounded-t-xl mt-4" />
                </div>

                {/* Rank 3 */}
                <div className="order-3 md:order-3 flex flex-col items-center group">
                  <div className="bg-white/20 backdrop-blur-xl border border-white/10 p-5 rounded-2xl w-full text-center shadow-lg transition-transform duration-300 group-hover:-translate-y-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-orange-400/40" />
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-orange-400/30 shadow-lg bg-orange-400/10 flex items-center justify-center text-2xl font-bold text-orange-300">
                        {top3[2]?.photoURL ? <img src={top3[2].photoURL} alt="" className="w-full h-full object-cover" /> : getInitials(top3[2]?.displayName)}
                      </div>
                      <div className="absolute -bottom-2 right-0 bg-orange-400/80 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">3</div>
                    </div>
                    <h3 className="text-base font-semibold text-white/90">{top3[2]?.displayName || 'Anonymous'}</h3>
                    <p className="text-xs text-orange-300 mb-2">Bronze Level</p>
                    <div className="py-1 px-3 bg-orange-400/10 rounded-full inline-block">
                      <span className="font-bold text-orange-300 text-sm">{top3[2]?.civicScore || 0} points</span>
                    </div>
                  </div>
                  <div className="hidden md:block w-full h-12 bg-white/5 rounded-t-xl mt-4 opacity-40" />
                </div>
              </section>
            )}

            {/* Contributors List */}
            <section className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4 px-3">
                <h2 className="text-base font-bold text-white/90">Recent Activity</h2>
                <span className="text-white/50 text-xs font-medium">Updated live</span>
              </div>
              <div className="space-y-2">
                {rest.length === 0 && top3.length < 3 ? (
                  users.map((u, idx) => (
                    <ContributorRow key={u.id} user={u} rank={idx + 1} isCurrentUser={user?.uid === u.id} />
                  ))
                ) : (
                  rest.map((u, idx) => (
                    <ContributorRow key={u.id} user={u} rank={idx + 4} isCurrentUser={user?.uid === u.id} />
                  ))
                )}
              </div>
              <button className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-white/10 text-white/50 text-sm font-medium hover:border-white/30 hover:text-white/70 transition-all">
                View Full Ranking
              </button>
            </section>

            {/* How Scoring Works */}
            <div className="mt-6">
              <GamificationGuide userScore={0} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ContributorRow({ user: u, rank, isCurrentUser }) {
  return (
    <div className={`bg-white/20 backdrop-blur-xl border border-white/10 p-3 rounded-xl flex items-center justify-between hover:bg-white/30 transition-all duration-200 group ${isCurrentUser ? 'ring-2 ring-cyan-400/40' : ''}`}>
      <div className="flex items-center gap-3">
        <span className="w-8 font-bold text-white/50 text-sm">#{rank}</span>
        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/10 bg-white/10 flex items-center justify-center font-bold text-white/60">
          {u?.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : getInitials(u?.displayName)}
        </div>
        <div>
          <p className="font-semibold text-sm text-white/90">{u?.displayName || 'Anonymous'}{isCurrentUser ? ' (You)' : ''}</p>
          <p className="text-xs text-white/50">{u?.totalReports || 0} Reports this month</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-cyan-300 text-sm">{u?.civicScore || 0} points</p>
        <span className="material-symbols-outlined text-sm text-green-400">trending_up</span>
      </div>
    </div>
  );
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
