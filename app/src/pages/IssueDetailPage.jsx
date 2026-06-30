import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { useAuth } from '../hooks/useAuth';
import IssueStatusBadge from '../components/issues/IssueStatusBadge';
import UpvoteButton from '../components/issues/UpvoteButton';
import IssueTimeline from '../components/issues/IssueTimeline';
import CommentSection from '../components/issues/CommentSection';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS } from '@shared/constants.js';
import { formatDistanceToNow } from 'date-fns';

export default function IssueDetailPage() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!issueId) return;
    const unsubscribe = onSnapshot(doc(db, 'issues', issueId), (docSnap) => {
      if (docSnap.exists()) {
        setIssue({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [issueId]);

  useEffect(() => {
    if (!issueId) return;
    const q = query(collection(db, 'issues', issueId, 'timeline'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTimeline(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [issueId]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
    </div>
  );
  if (!issue) return <div className="flex items-center justify-center h-screen text-white/50 text-sm bg-slate-900">Issue not found</div>;

  const category = ISSUE_CATEGORIES[issue.category] || ISSUE_CATEGORIES.other;
  const severity = SEVERITY_LEVELS[issue.severity] || SEVERITY_LEVELS[2];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="fixed top-[72px] left-0 w-full bg-white/20 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center gap-3 z-40">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-lg transition-all active:scale-95">
          <span className="material-symbols-outlined text-white/80">arrow_back</span>
        </button>
        <h1 className="font-semibold text-white/90 truncate flex-1 text-base">{issue.title}</h1>
        <IssueStatusBadge status={issue.status} />
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4 pt-[144px]">
        {issue.mediaUrls && issue.mediaUrls.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-sm">
            <img src={issue.mediaUrls[0]} alt={issue.title} className="w-full h-64 object-cover" />
          </div>
        )}

        <div className="bg-white/20 backdrop-blur-xl border border-white/10 rounded-xl p-5 space-y-3 shadow-sm">
          <h2 className="text-lg font-bold text-white/90">{issue.title}</h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: category.color + '25', color: category.color }}>{category.label}</span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: severity.color + '25', color: severity.color }}>{severity.label}</span>
          </div>
          {issue.description && <p className="text-sm text-white/70 leading-relaxed">{issue.description}</p>}
          <div className="flex items-center gap-4 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {issue.createdAt ? formatDistanceToNow(new Date(issue.createdAt.seconds ? issue.createdAt.seconds * 1000 : issue.createdAt), { addSuffix: true }) : 'just now'}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {issue.address || 'Location set'}
            </span>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-r from-[#1A56DB] to-[#06B6D4]">
              {issue.reporterPhoto ? <img src={issue.reporterPhoto} alt="" className="w-full h-full object-cover" /> : <span className="font-semibold text-white">{issue.reporterName?.[0] || 'U'}</span>}
            </div>
            <div>
              <p className="text-sm font-medium text-white/90">{issue.reporterName}</p>
              <p className="text-xs text-white/50">Reporter</p>
            </div>
          </div>
          <UpvoteButton issueId={issue.id} currentUpvotes={issue.upvotes} upvotedBy={issue.upvotedBy || []} />
        </div>

        <div className="bg-white/20 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-white/90 mb-3 text-sm">Status Timeline</h3>
          <IssueTimeline events={timeline} />
        </div>

        <div className="bg-white/20 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-sm">
          <CommentSection issueId={issue.id} />
        </div>
      </div>
    </div>
  );
}
