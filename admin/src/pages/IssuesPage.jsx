import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { ISSUE_CATEGORIES, ISSUE_STATUSES, SEVERITY_LEVELS, DEPARTMENTS } from '@shared/constants.js';
import { formatDistanceToNow } from 'date-fns';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [updateModal, setUpdateModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const navigate = useNavigate();
  const perPage = 15;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'issues'), (snapshot) => {
      setIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = issues.filter(i => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
    if (search && !i.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const pendingCount = issues.filter(i => i.status === 'open' || i.status === 'pending').length;
  const verifiedCount = issues.filter(i => i.status === 'verified' || i.status === 'community_verified').length;
  const criticalCount = issues.filter(i => i.severity >= 4).length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;

  const handleStatusUpdate = async () => {
    if (!updateModal || !newStatus) return;
    try {
      const updates = { status: newStatus, updatedAt: new Date() };
      if (newStatus === 'resolved') {
        updates.resolvedAt = new Date();
        updates.resolutionNote = resolutionNote;
      }
      await updateDoc(doc(db, 'issues', updateModal.id), updates);
      toast.success('Status updated');
      setUpdateModal(null);
      setNewStatus('');
      setResolutionNote('');
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const handleAssignDept = async (issueId, dept) => {
    try {
      await updateDoc(doc(db, 'issues', issueId), { assignedDept: dept, department: dept, status: 'assigned', assignedAt: new Date(), updatedAt: new Date() });
      toast.success('Department assigned');
    } catch (e) {
      toast.error('Assignment failed');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white/90">Issues Queue</h1>
          <p className="text-white/60 text-sm sm:text-base">Manage and resolve reported civic infrastructure issues.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 glass-card px-4 py-2 rounded-lg text-sm font-semibold text-white/70 hover:bg-white/20 transition-all">
            <span className="material-symbols-outlined text-xl">filter_list</span>
            Filters
          </button>
          <button className="flex items-center gap-2 glass-card px-4 py-2 rounded-lg text-sm font-semibold text-white/70 hover:bg-white/20 transition-all">
            <span className="material-symbols-outlined text-xl">file_download</span>
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/50">Pending</p>
            <p className="text-2xl font-bold text-white/90">{pendingCount}</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">verified</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/50">Verified</p>
            <p className="text-2xl font-bold text-white/90">{verifiedCount}</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error">
            <span className="material-symbols-outlined">priority_high</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/50">Critical</p>
            <p className="text-2xl font-bold text-white/90">{criticalCount}</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/50">Resolved</p>
            <p className="text-2xl font-bold text-white/90">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="glass-card p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xl">search</span>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="bg-white/10 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 ring-white/30 w-64 max-w-full text-white placeholder:text-white/40"
              placeholder="Search issues..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 ring-white/30 text-white"
          >
            <option value="all" className="bg-slate-800 text-white">All Status</option>
            {Object.entries(ISSUE_STATUSES).map(([k, v]) => <option key={k} value={k} className="bg-slate-800 text-white">{v.label}</option>)}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
            className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 ring-white/30 text-white"
          >
            <option value="all" className="bg-slate-800 text-white">All Categories</option>
            {Object.entries(ISSUE_CATEGORIES).map(([k, v]) => <option key={k} value={k} className="bg-slate-800 text-white">{v.label}</option>)}
          </select>
        </div>
        <p className="text-sm font-semibold text-white/50 whitespace-nowrap">Showing {paged.length} of {filtered.length}</p>
      </div>

      {/* Issues Table */}
      <div className="glass-card rounded-xl overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paged.map((issue, idx) => (
                <tr key={issue.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-sm text-white/40">{page * perPage + idx + 1}</td>
                  <td className="px-6 py-4 font-bold text-white/90">{issue.title}</td>
                  <td className="px-6 py-4">
                    <span
                      className="status-chip"
                      style={{ backgroundColor: (ISSUE_CATEGORIES[issue.category]?.color || '#6B7280') + '15', color: ISSUE_CATEGORIES[issue.category]?.color || '#6B7280' }}
                    >
                      {ISSUE_CATEGORIES[issue.category]?.label || issue.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold" style={{ color: SEVERITY_LEVELS[issue.severity]?.color }}>{issue.severity}</td>
                  <td className="px-6 py-4">
                    <span
                      className="status-chip"
                      style={{ backgroundColor: ISSUE_STATUSES[issue.status]?.bg, color: ISSUE_STATUSES[issue.status]?.color }}
                    >
                      {ISSUE_STATUSES[issue.status]?.label || issue.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/50">
                    {issue.createdAt ? formatDistanceToNow(new Date(issue.createdAt.seconds * 1000), { addSuffix: true }) : ''}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => navigate(`/issues/${issue.id}`)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
                      >
                        <span className="material-symbols-outlined text-xl">visibility</span>
                      </button>
                      <button
                        onClick={() => { setUpdateModal(issue); setNewStatus(issue.status); }}
                        className="text-cyan-300 font-bold text-sm hover:underline"
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/50">{filtered.length} issues</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30 text-white/50 transition-all">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-white/50">Page {page + 1} of {totalPages || 1}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30 text-white/50 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {updateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setUpdateModal(null)}>
          <div className="glass-card p-6 w-full max-w-md rounded-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-white/90 mb-4">Update Issue</h3>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 ring-white/30 mb-3 text-white"
            >
              {Object.entries(ISSUE_STATUSES).map(([k, v]) => <option key={k} value={k} className="bg-slate-800 text-white">{v.label}</option>)}
            </select>
            {newStatus === 'resolved' && (
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Resolution note..."
                rows={3}
                className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 ring-white/30 mb-3 text-white placeholder:text-white/40"
              />
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setUpdateModal(null)} className="px-4 py-2 text-sm text-white/50 hover:bg-white/10 rounded-xl transition-all">Cancel</button>
              <button onClick={handleStatusUpdate} className="px-4 py-2 text-sm civic-gradient text-white rounded-xl shadow-lg hover:shadow-xl transition-all">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
