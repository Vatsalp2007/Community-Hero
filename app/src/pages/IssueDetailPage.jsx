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
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
  if (!issue) return <div className="flex items-center justify-center h-screen text-on-surface-variant text-body-lg bg-background">Issue not found</div>;

  const category = ISSUE_CATEGORIES[issue.category] || ISSUE_CATEGORIES.other;
  const severity = SEVERITY_LEVELS[issue.severity] || SEVERITY_LEVELS[2];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-16 left-0 w-full bg-white/70 backdrop-blur-xl border-b border-white/20 px-4 py-3 flex items-center gap-3 z-40">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/40 rounded-lg transition-all active:scale-95">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <h1 className="font-semibold text-on-surface truncate flex-1 font-headline-md">{issue.title}</h1>
        <IssueStatusBadge status={issue.status} />
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4 pt-28">
        {issue.mediaUrls && issue.mediaUrls.length > 0 && (
          <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-sm">
            <img src={issue.mediaUrls[0]} alt={issue.title} className="w-full h-64 object-cover" />
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl p-5 space-y-3 shadow-sm">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">{issue.title}</h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: category.color + '15', color: category.color }}>{category.label}</span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: severity.color + '15', color: severity.color }}>{severity.label}</span>
          </div>
          {issue.description && <p className="text-body-md text-on-surface-variant">{issue.description}</p>}
          <div className="flex items-center gap-4 text-xs text-on-surface-variant">
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

        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-r from-[#1A56DB] to-[#06B6D4]">
              {issue.reporterPhoto ? <img src={issue.reporterPhoto} alt="" className="w-full h-full object-cover" /> : <span className="font-semibold text-white">{issue.reporterName?.[0] || 'U'}</span>}
            </div>
            <div>
              <p className="text-body-md font-medium text-on-surface">{issue.reporterName}</p>
              <p className="text-xs text-on-surface-variant">Reporter</p>
            </div>
          </div>
          <UpvoteButton issueId={issue.id} currentUpvotes={issue.upvotes} upvotedBy={issue.upvotedBy || []} />
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-on-surface mb-3 font-headline-md">Status Timeline</h3>
          <IssueTimeline events={timeline} />
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl p-5 shadow-sm">
          <CommentSection issueId={issue.id} />
        </div>
      </div>
    </div>
  );
}
