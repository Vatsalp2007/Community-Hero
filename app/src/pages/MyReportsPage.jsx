import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseReady } from '@shared/firebase.js';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

const STATUS_STYLE = {
  assigned: 'bg-blue-500/20 text-blue-300',
  'community verified': 'bg-green-500/20 text-green-300',
  open: 'bg-white/10 text-white/60',
  resolved: 'bg-green-500 text-white',
  verified: 'bg-green-500/20 text-green-300',
  in_progress: 'bg-orange-500/20 text-orange-300',
};

const CATEGORY_STYLE = {
  'Garbage / Waste': 'text-green-300 bg-green-500/20',
  'Open Manhole': 'text-blue-300 bg-blue-500/20',
  'Road Damage': 'text-red-300 bg-red-500/20',
  'Broken Streetlight': 'text-orange-300 bg-orange-500/20',
  default: 'text-blue-300 bg-blue-500/20',
};

export default function MyReportsPage() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!user || !isFirebaseReady()) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'issues'), where('reportedBy', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issueList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      issueList.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
      setIssues(issueList);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, [user]);

  const filteredIssues = activeTab === 'all' ? issues : issues.filter(i => {
    if (activeTab === 'open') return i.status === 'open' || i.status === 'verified';
    if (activeTab === 'in_progress') return i.status === 'in_progress' || i.status === 'assigned';
    if (activeTab === 'resolved') return i.status === 'resolved';
    return true;
  });

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="pt-24 pb-4 px-6 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white/90 mb-1">My Reports</h2>
            <p className="text-sm text-white/60">Monitor and track the status of your submitted civic issues.</p>
          </div>
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap active:scale-95 transition-all ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white shadow-md'
                    : 'bg-white/20 backdrop-blur-xl border border-white/10 text-white/70 hover:bg-white/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
              <p className="text-sm text-white/50 mt-3">Loading reports...</p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-white/30">assignment</span>
              </div>
              <h3 className="font-semibold text-white/80 mb-1">No reports yet</h3>
              <p className="text-sm text-white/50 mb-4">Be the first to report an issue in your community.</p>
              <button onClick={() => navigate('/report')} className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #1A56DB, #06B6D4)' }}>
                Report an Issue
              </button>
            </div>
          ) : (
            filteredIssues.map(issue => (
              <div
                key={issue.id}
                onClick={() => navigate(`/issues/${issue.id}`)}
                className="bg-white/20 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex flex-col md:flex-row gap-4 group hover:bg-white/30 hover:border-white/30 transition-all duration-300 cursor-pointer"
              >
                <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                  {issue.mediaUrls && issue.mediaUrls[0] ? (
                    <img src={issue.mediaUrls[0]} alt={issue.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center border border-dashed border-white/10 rounded-lg">
                      <span className="material-symbols-outlined text-4xl text-white/30">photo_camera</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base font-semibold text-white/90 group-hover:text-white transition-colors">{issue.title}</h3>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[issue.status] || 'bg-white/10 text-white/60'}`}>
                        {issue.status === 'in_progress' ? 'In Progress' : issue.status === 'assigned' ? 'Assigned' : issue.status === 'verified' ? 'Community Verified' : issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {issue.category && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${CATEGORY_STYLE[issue.category] || CATEGORY_STYLE.default}`}>
                          {issue.category}
                        </span>
                      )}
                      {issue.severity && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          issue.severity >= 4 ? 'text-red-300 bg-red-500/20' : issue.severity >= 3 ? 'text-orange-300 bg-orange-500/20' : 'text-green-300 bg-green-500/20'
                        }`}>
                          {issue.severity >= 4 ? 'Critical' : issue.severity >= 3 ? 'High' : issue.severity >= 2 ? 'Moderate' : 'Minor'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                      <span className="material-symbols-outlined text-[16px]">keyboard_double_arrow_up</span>
                      <span>{issue.upvotes || 0}</span>
                      <span className="opacity-30">•</span>
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>{issue.createdAt ? formatDistanceToNow(new Date(issue.createdAt.seconds ? issue.createdAt.seconds * 1000 : issue.createdAt), { addSuffix: true }) : 'just now'}</span>
                    </div>
                    {issue.address && (
                      <div className="flex items-center gap-1 text-white/40 text-xs mt-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span className="text-[11px]">{issue.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar (desktop) */}
      <aside className="hidden xl:flex fixed right-6 top-24 w-64 flex-col gap-3">
        <div className="bg-white/20 backdrop-blur-xl border border-white/10 p-4 rounded-xl">
          <h4 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-wider">Quick Actions</h4>
          <button onClick={() => navigate('/report')} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/10 text-white/80 transition-all mb-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-300">add_circle</span>
              <span className="text-sm">New Report</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-white/30">chevron_right</span>
          </button>
          <button onClick={() => navigate('/profile')} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/10 text-white/80 transition-all">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-300">analytics</span>
              <span className="text-sm">Civic Score</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-white/30">chevron_right</span>
          </button>
        </div>
        <div className="bg-white/20 backdrop-blur-xl border border-white/10 p-4 rounded-xl">
          <h4 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-wider">Civic Status</h4>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 flex items-center justify-center">
              <span className="font-bold text-cyan-300 text-sm">{userProfile?.civicScore || 0}</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-white/90">Great Contributor</div>
              <div className="text-[12px] text-white/50">Top 15% in your area</div>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] h-full rounded-full transition-all" style={{ width: `${Math.min((userProfile?.civicScore || 0) / 5, 100)}%` }} />
          </div>
        </div>
      </aside>
    </div>
  );
}
