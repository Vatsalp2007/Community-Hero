import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, collection, query, orderBy, onSnapshot as onSnap } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { ISSUE_CATEGORIES, ISSUE_STATUSES, SEVERITY_LEVELS, DEPARTMENTS } from '@shared/constants.js';
import IssueStatusBadge from '@/components/issues/IssueStatusBadge';
import IssueTimeline from '@/components/issues/IssueTimeline';
import CommentSection from '@/components/issues/CommentSection';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IssueDetailPage() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!issueId) return;
    const unsub = onSnapshot(doc(db, 'issues', issueId), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setIssue(data);
        setStatus(data.status);
        setDepartment(data.assignedDept || data.department || '');
      }
    });
    return unsub;
  }, [issueId]);

  useEffect(() => {
    if (!issueId) return;
    const q = query(collection(db, 'issues', issueId, 'timeline'), orderBy('createdAt', 'asc'));
    const unsub = onSnap(q, (snap) => setTimeline(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, [issueId]);

  const handleSave = async () => {
    if (!issue) return;
    try {
      const updates = { status, department, updatedAt: new Date() };
      if (status === 'resolved') { updates.resolvedAt = new Date(); updates.resolutionNote = note; }
      if (status === 'rejected') { updates.rejectionReason = note; }
      await updateDoc(doc(db, 'issues', issueId), updates);
      toast.success('Issue updated');
    } catch (e) { toast.error('Update failed'); }
  };

  if (!issue) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const category = ISSUE_CATEGORIES[issue.category] || ISSUE_CATEGORIES.other;
  const severity = SEVERITY_LEVELS[issue.severity] || SEVERITY_LEVELS[2];

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-label-md text-on-surface-variant hover:text-primary transition-all mb-lg"
      >
        <ArrowLeft size={16} /> Back to Issues
      </button>

      <div className="glass-card p-lg rounded-xl mb-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-headline-md font-bold text-on-surface">{issue.title}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span
                className="status-chip"
                style={{ backgroundColor: category.color + '15', color: category.color }}
              >
                {category.label}
              </span>
              <span
                className="status-chip"
                style={{ backgroundColor: severity.color + '15', color: severity.color }}
              >
                {severity.label}
              </span>
              <IssueStatusBadge status={issue.status} />
            </div>
          </div>
        </div>

        {issue.mediaUrls?.[0] && (
          <img src={issue.mediaUrls[0]} alt="" className="w-full h-64 object-cover rounded-xl mt-4" />
        )}
        {issue.description && (
          <p className="text-body-md text-on-surface-variant mt-4">{issue.description}</p>
        )}
        <div className="flex items-center gap-2 text-body-md text-on-surface-variant mt-2">
          <MapPin size={14} /> {issue.address || 'No address'}
        </div>
      </div>

      <div className="glass-card p-lg rounded-xl mb-lg">
        <h3 className="font-semibold text-on-surface mb-4">Admin Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white/50 border border-outline-variant/30 rounded-lg px-4 py-2 text-label-md focus:ring-2 focus:ring-primary/20"
            >
              {Object.entries(ISSUE_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-white/50 border border-outline-variant/30 rounded-lg px-4 py-2 text-label-md focus:ring-2 focus:ring-primary/20"
            >
              {Object.entries(DEPARTMENTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-label-md text-on-surface-variant mb-1">Resolution Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full bg-white/50 border border-outline-variant/30 rounded-lg px-4 py-2 text-label-md focus:ring-2 focus:ring-primary/20"
            placeholder="Add a note..."
          />
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 civic-gradient text-white text-label-md font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Save Changes
        </button>
      </div>

      <div className="glass-card p-lg rounded-xl mb-lg">
        <h3 className="font-semibold text-on-surface mb-3">Timeline</h3>
        <IssueTimeline events={timeline} />
      </div>

      <div className="glass-card p-lg rounded-xl">
        <CommentSection issueId={issueId} />
      </div>
    </div>
  );
}
