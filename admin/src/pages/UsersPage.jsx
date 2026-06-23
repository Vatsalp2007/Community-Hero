import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

const ROLE_PILL_CLASSES = {
  officer: 'bg-secondary-container/20 text-on-secondary-container border-secondary-container/30',
  admin: 'bg-primary/10 text-primary border-primary/20',
  citizen: 'bg-outline-variant/20 text-on-surface-variant border-outline-variant/30',
  moderator: 'bg-outline-variant/20 text-on-surface-variant border-outline-variant/30',
};

const AVATAR_COLORS = {
  officer: 'bg-secondary/10 text-secondary',
  admin: 'bg-tertiary-fixed-dim/30 text-tertiary',
  citizen: 'bg-primary/10 text-primary',
  moderator: 'bg-primary/10 text-primary',
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const filtered = users.filter(u => {
    if (activeTab === 'officials' && u.role !== 'officer' && u.role !== 'admin') return false;
    if (activeTab === 'reports') return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.displayName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalActive = users.filter(u => u.role !== 'deactivated').length;
  const avgScore = users.length > 0 ? Math.round(users.reduce((sum, u) => sum + (u.civicScore || 0), 0) / users.length) : 0;
  const pendingVerifications = users.filter(u => !u.verified).length;

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast.success('Role updated');
    } catch (e) { toast.error('Update failed'); }
  };

  return (
    <div className="w-full space-y-6">
      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">User Management</h1>
          <p className="text-on-surface-variant text-sm sm:text-base mt-1">
            Monitor citizen engagement, audit administrative access, and manage reputation scores across the CivicAI ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-2 glass p-1.5 rounded-xl shrink-0">
          <button
            onClick={() => { setActiveTab('all'); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'all' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            All Users
          </button>
          <button
            onClick={() => { setActiveTab('officials'); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'officials' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Officials
          </button>
          <button
            onClick={() => { setActiveTab('reports'); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'reports' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Reports
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl flex flex-col justify-between min-h-[110px] border-l-4 border-l-primary">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Active Users</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">{totalActive.toLocaleString()}</span>
            <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-base">trending_up</span>
            </span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-xl flex flex-col justify-between min-h-[110px] border-l-4 border-l-secondary">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Avg Civic Score</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">{avgScore}</span>
            <span className="text-secondary text-sm font-semibold">Healthy</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-xl flex flex-col justify-between min-h-[110px] border-l-4 border-l-tertiary">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Pending Verifications</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold">{pendingVerifications}</span>
            <span className="text-tertiary text-sm font-semibold">Action Required</span>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="glass-card rounded-xl overflow-hidden shadow-xl border border-white/30">
        {/* Table Controls */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-4 bg-white/30">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">filter_list</span>
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="pl-10 pr-8 py-2 bg-white/60 border border-outline-variant/30 rounded-lg text-sm focus:ring-primary/20 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="officer">Officer</option>
                <option value="citizen">Citizen</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg">expand_more</span>
            </div>
            <span className="text-sm font-semibold text-on-surface-variant">Showing {paginatedUsers.length} of {filtered.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search citizens..."
                className="pl-10 pr-4 py-2 bg-white/60 border border-outline-variant/30 rounded-lg text-sm focus:ring-primary/20 transition-all w-48 max-w-full"
              />
            </div>
            <button className="p-2 hover:bg-white/40 rounded-lg transition-all text-on-surface-variant">
              <span className="material-symbols-outlined">download</span>
            </button>
            <button className="p-2 hover:bg-white/40 rounded-lg transition-all text-on-surface-variant">
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/10">
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant/70 uppercase">User</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant/70 uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant/70 uppercase text-center">Civic Score</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant/70 uppercase text-center">Reports</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant/70 uppercase">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant/70 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {paginatedUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${AVATAR_COLORS[user.role] || AVATAR_COLORS.citizen} overflow-hidden shrink-0`}>
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          user.displayName?.[0] || 'U'
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{user.displayName}</p>
                        <p className="text-xs text-on-surface-variant">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${ROLE_PILL_CLASSES[user.role] || ROLE_PILL_CLASSES.citizen}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-2xl font-bold text-primary">{user.civicScore || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold">{user.totalReports || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-on-surface-variant">
                      {user.createdAt?.seconds ? formatDistanceToNow(new Date(user.createdAt.seconds * 1000), { addSuffix: true }) : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block text-left">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="pl-4 pr-8 py-1.5 bg-white border border-outline-variant/30 rounded-lg text-sm focus:ring-primary/20 appearance-none cursor-pointer"
                      >
                        <option value="citizen">Citizen</option>
                        <option value="officer">Officer</option>
                        <option value="admin">Admin</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base">expand_more</span>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant text-sm">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/20 flex items-center justify-between bg-white/30">
          <p className="text-sm font-semibold text-on-surface-variant">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 border border-outline-variant/30 rounded-lg text-sm font-semibold transition-all ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/50'}`}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
