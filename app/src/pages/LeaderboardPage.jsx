import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { useAuth } from '../hooks/useAuth';

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
    <div className="min-h-screen bg-background pb-20" style={{ backgroundImage: 'radial-gradient(at 0% 0%, hsla(220,100%,95%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(190,100%,95%,1) 0, transparent 50%)' }}>
      <div className="pt-24 pb-4 px-gutter max-w-container-max mx-auto">
        {/* Header & Filter */}
        <section className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <h1 className="font-display-lg text-display-lg text-primary mb-xs">City Contributors</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Honoring the citizens who make our community safer and more vibrant through active engagement and reporting.</p>
          </div>
          <div className="flex p-1 bg-surface-container-high rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-lg py-sm rounded-lg font-label-md text-label-md transition-all ${activeTab === 'weekly' ? 'bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white shadow-md' : 'text-on-surface-variant hover:bg-white/50'}`}
            >
              This Week
            </button>
            <button
              onClick={() => setActiveTab('alltime')}
              className={`px-lg py-sm rounded-lg font-label-md text-label-md transition-all ${activeTab === 'alltime' ? 'bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white shadow-md' : 'text-on-surface-variant hover:bg-white/50'}`}
            >
              All Time
            </button>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Podium Section (Top 3) */}
            {top3.length >= 3 && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-20 items-end">
                {/* Rank 2 */}
                <div className="order-2 md:order-1 flex flex-col items-center group">
                  <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-lg rounded-2xl w-full text-center shadow-lg transition-transform duration-300 group-hover:-translate-y-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-secondary-fixed-dim" />
                    <div className="relative w-24 h-24 mx-auto mb-md">
                      <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-secondary-fixed-dim/30 shadow-lg bg-secondary-container flex items-center justify-center text-2xl font-bold text-secondary">
                        {top3[1]?.photoURL ? <img src={top3[1].photoURL} alt="" className="w-full h-full object-cover" /> : getInitials(top3[1]?.name)}
                      </div>
                      <div className="absolute -bottom-2 right-0 bg-secondary-fixed-dim text-on-secondary-fixed w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">2</div>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">{top3[1]?.name || 'Anonymous'}</h3>
                    <p className="font-label-md text-label-md text-secondary mb-sm">Silver Level</p>
                    <div className="py-xs px-md bg-secondary/10 rounded-full inline-block">
                      <span className="font-bold text-secondary">{top3[1]?.civicScore || 0} points</span>
                    </div>
                  </div>
                  <div className="hidden md:block w-full h-16 bg-surface-container-high rounded-t-xl mt-4 opacity-50" />
                </div>

                {/* Rank 1 */}
                <div className="order-1 md:order-2 flex flex-col items-center group z-10">
                  <div className="bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] p-[1px] rounded-3xl w-full shadow-2xl transition-transform duration-300 group-hover:-translate-y-4">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-xl rounded-[23px] w-full text-center relative overflow-hidden">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
                      <div className="relative w-32 h-32 mx-auto mb-lg">
                        <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-primary shadow-2xl bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] flex items-center justify-center text-3xl font-bold text-white">
                          {top3[0]?.photoURL ? <img src={top3[0].photoURL} alt="" className="w-full h-full object-cover" /> : getInitials(top3[0]?.name)}
                        </div>
                        <div className="absolute -bottom-2 right-2 bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ring-4 ring-white">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-xs mb-xs">
                        <h3 className="font-headline-lg text-headline-lg text-on-surface">{top3[0]?.name || 'Anonymous'}</h3>
                        {user?.uid === top3[0]?.id && <span className="text-primary font-bold">(You)</span>}
                      </div>
                      <p className="font-label-md text-label-md text-primary-container mb-md">Gold Level</p>
                      <div className="py-sm px-xl bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white rounded-full inline-block shadow-lg">
                        <span className="font-bold text-lg">{top3[0]?.civicScore || 0} points</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block w-full h-32 bg-surface-container rounded-t-xl mt-4" />
                </div>

                {/* Rank 3 */}
                <div className="order-3 md:order-3 flex flex-col items-center group">
                  <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-lg rounded-2xl w-full text-center shadow-lg transition-transform duration-300 group-hover:-translate-y-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-tertiary" />
                    <div className="relative w-24 h-24 mx-auto mb-md">
                      <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-tertiary/30 shadow-lg bg-tertiary/10 flex items-center justify-center text-2xl font-bold text-tertiary">
                        {top3[2]?.photoURL ? <img src={top3[2].photoURL} alt="" className="w-full h-full object-cover" /> : getInitials(top3[2]?.name)}
                      </div>
                      <div className="absolute -bottom-2 right-0 bg-tertiary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">3</div>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">{top3[2]?.name || 'Anonymous'}</h3>
                    <p className="font-label-md text-label-md text-tertiary mb-sm">Bronze Level</p>
                    <div className="py-xs px-md bg-tertiary/10 rounded-full inline-block">
                      <span className="font-bold text-tertiary">{top3[2]?.civicScore || 0} points</span>
                    </div>
                  </div>
                  <div className="hidden md:block w-full h-12 bg-surface-container-high rounded-t-xl mt-4 opacity-40" />
                </div>
              </section>
            )}

            {/* Contributors List */}
            <section className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-lg px-md">
                <h2 className="font-headline-md text-headline-md text-on-surface">Recent Activity</h2>
                <span className="text-on-surface-variant text-sm font-medium">Updated live</span>
              </div>
              <div className="space-y-sm">
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
              <button className="w-full mt-lg py-md rounded-xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant font-label-md hover:border-primary/40 hover:text-primary transition-all">
                View Full Ranking
              </button>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function ContributorRow({ user: u, rank, isCurrentUser }) {
  return (
    <div className={`bg-white/70 backdrop-blur-xl border border-white/20 p-md rounded-xl flex items-center justify-between hover:bg-white transition-all duration-200 group ${isCurrentUser ? 'ring-2 ring-primary/30' : ''}`}>
      <div className="flex items-center gap-md">
        <span className="w-8 font-bold text-on-surface-variant">#{rank}</span>
        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-surface-variant bg-surface-container flex items-center justify-center font-bold text-on-surface-variant">
          {u?.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : getInitials(u?.name)}
        </div>
        <div>
          <p className="font-bold text-on-surface">{u?.name || 'Anonymous'}{isCurrentUser ? ' (You)' : ''}</p>
          <p className="text-xs text-on-surface-variant">{u?.totalReports || 0} Reports this month</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-primary">{u?.civicScore || 0} points</p>
        <span className="material-symbols-outlined text-sm text-green-500">trending_up</span>
      </div>
    </div>
  );
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
