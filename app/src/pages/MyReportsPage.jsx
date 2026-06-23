import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseReady } from '@shared/firebase.js';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

const STATUS_STYLE = {
  assigned: 'bg-blue-100 text-blue-700',
  'community verified': 'bg-green-100 text-green-700',
  open: 'bg-surface-variant text-on-surface-variant',
  resolved: 'bg-green-500 text-white',
  verified: 'bg-green-100 text-green-700',
  in_progress: 'bg-orange-100 text-orange-700',
};

const CATEGORY_STYLE = {
  'Garbage / Waste': 'text-green-600 bg-green-50',
  'Open Manhole': 'text-primary bg-primary/5',
  'Road Damage': 'text-red-700 bg-red-50',
  'Broken Streetlight': 'text-orange-700 bg-orange-50',
  default: 'text-primary bg-primary/5',
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
    <div className="min-h-screen bg-background" style={{ backgroundImage: 'radial-gradient(at 0% 0%, rgba(0,63,177,0.05) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0,104,122,0.05) 0px, transparent 50%)' }}>
      {/* Header */}
      <div className="pt-24 pb-4 px-gutter max-w-container-max mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">My Reports</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Monitor and track the status of your submitted civic issues.</p>
          </div>
          {/* Filters */}
          <div className="flex gap-xs overflow-x-auto pb-xs" style={{ scrollbarWidth: 'none' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-lg py-sm rounded-full font-label-md text-label-md whitespace-nowrap active:scale-95 transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white/70 backdrop-blur-xl border border-white/20 text-on-surface-variant hover:bg-white/90'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-md">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="text-sm text-on-surface-variant mt-3">Loading reports...</p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">assignment</span>
              </div>
              <h3 className="font-semibold text-on-surface mb-1">No reports yet</h3>
              <p className="text-sm text-on-surface-variant mb-4">Be the first to report an issue in your community.</p>
              <button onClick={() => navigate('/report')} className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl shadow-lg bg-gradient-to-r from-[#1A56DB] to-[#06B6D4]">
                Report an Issue
              </button>
            </div>
          ) : (
            filteredIssues.map(issue => (
              <div
                key={issue.id}
                onClick={() => navigate(`/issues/${issue.id}`)}
                className="bg-white/70 backdrop-blur-xl border border-white/20 p-lg rounded-xl flex flex-col md:flex-row gap-lg group hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
              >
                <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                  {issue.mediaUrls && issue.mediaUrls[0] ? (
                    <img src={issue.mediaUrls[0]} alt={issue.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center border border-dashed border-outline rounded-lg">
                      <span className="material-symbols-outlined text-4xl text-outline-variant">photo_camera</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-xs">
                      <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">{issue.title}</h3>
                      <span className={`px-sm py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${STATUS_STYLE[issue.status] || 'bg-surface-variant text-on-surface-variant'}`}>
                        {issue.status === 'in_progress' ? 'In Progress' : issue.status === 'assigned' ? 'Assigned' : issue.status === 'verified' ? 'Community Verified' : issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-sm mb-sm">
                      {issue.category && (
                        <span className={`font-label-md text-label-md px-2 py-0.5 rounded ${CATEGORY_STYLE[issue.category] || CATEGORY_STYLE.default}`}>
                          {issue.category}
                        </span>
                      )}
                      {issue.severity && (
                        <span className={`font-label-md text-label-md px-2 py-0.5 rounded ${
                          issue.severity >= 4 ? 'text-red-600 bg-red-50' : issue.severity >= 3 ? 'text-orange-600 bg-orange-50' : 'text-green-700 bg-green-50'
                        }`}>
                          {issue.severity >= 4 ? 'Critical' : issue.severity >= 3 ? 'High' : issue.severity >= 2 ? 'Moderate' : 'Minor'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-xs text-on-surface-variant font-label-md text-label-md">
                      <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_up</span>
                      <span>{issue.upvotes || 0}</span>
                      <span className="mx-xs opacity-30">•</span>
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      <span>{issue.createdAt ? formatDistanceToNow(new Date(issue.createdAt.seconds ? issue.createdAt.seconds * 1000 : issue.createdAt), { addSuffix: true }) : 'just now'}</span>
                    </div>
                    {issue.address && (
                      <div className="flex items-center gap-xs text-on-surface-variant font-label-md text-label-md mt-1 opacity-75">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span className="text-[12px]">{issue.address}</span>
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
      <aside className="hidden xl:flex fixed right-gutter top-24 w-64 flex-col gap-md">
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-lg rounded-xl">
          <h4 className="font-label-md text-label-md font-bold text-primary mb-md uppercase tracking-wider">Quick Actions</h4>
          <button onClick={() => navigate('/report')} className="w-full flex items-center justify-between p-sm rounded-lg hover:bg-primary/5 text-on-surface transition-all mb-xs">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">add_circle</span>
              <span className="font-label-md text-label-md">New Report</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          </button>
          <button onClick={() => navigate('/profile')} className="w-full flex items-center justify-between p-sm rounded-lg hover:bg-primary/5 text-on-surface transition-all">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">analytics</span>
              <span className="font-label-md text-label-md">Civic Score</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          </button>
        </div>
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-lg rounded-xl">
          <h4 className="font-label-md text-label-md font-bold text-primary mb-md uppercase tracking-wider">Civic Status</h4>
          <div className="flex items-center gap-md mb-md">
            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center">
              <span className="font-bold text-primary text-label-md">{userProfile?.civicScore || 0}</span>
            </div>
            <div>
              <div className="font-label-md text-label-md font-bold">Great Contributor</div>
              <div className="font-body-md text-[12px] text-on-surface-variant">Top 15% in your area</div>
            </div>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${Math.min((userProfile?.civicScore || 0) / 5, 100)}%` }} />
          </div>
        </div>
      </aside>
    </div>
  );
}
