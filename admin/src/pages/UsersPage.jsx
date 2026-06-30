import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

const ROLE_PILL_CLASSES = {
  officer: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',
  admin: 'bg-purple-400/10 text-purple-300 border-purple-400/20',
  citizen: 'bg-white/10 text-white/60 border-white/10',
  moderator: 'bg-white/10 text-white/60 border-white/10',
};

const AVATAR_COLORS = {
  officer: 'bg-cyan-400/20 text-cyan-300',
  admin: 'bg-purple-400/20 text-purple-300',
  citizen: 'bg-blue-400/20 text-blue-300',
  moderator: 'bg-blue-400/20 text-blue-300',
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white/90">User Management</h1>
          <p className="text-white/60 text-sm sm:text-base mt-1">
            Monitor citizen engagement, audit administrative access, and manage reputation scores across the CivicAI ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl shrink-0">
          <button
            onClick={() => { setActiveTab('all'); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'all' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
          >
            All Users
          </button>
          <button
            onClick={() => { setActiveTab('officials'); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'officials' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
          >
            Officials
          </button>
          <button
            onClick={() => { setActiveTab('reports'); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'reports' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
          >
            Reports
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl flex flex-col justify-between min-h-[110px] border-l-4 border-l-cyan-400">
          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Total Active Users</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold text-white/90">{totalActive.toLocaleString()}</span>
            <span className="text-green-400 text-sm font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-base">trending_up</span>
            </span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-xl flex flex-col justify-between min-h-[110px] border-l-4 border-l-amber-400">
          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Avg Civic Score</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold text-white/90">{avgScore}</span>
            <span className="text-amber-400 text-sm font-semibold">Healthy</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-xl flex flex-col justify-between min-h-[110px] border-l-4 border-l-rose-400">
          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Pending Verifications</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold text-white/90">{pendingVerifications}</span>
            <span className="text-rose-400 text-sm font-semibold">Action Required</span>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="glass-card rounded-xl overflow-hidden shadow-xl shadow-black/20">
        {/* Table Controls */}
        <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-white/5">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-xl">filter_list</span>
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="pl-10 pr-8 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white focus:ring-white/30 transition-all appearance-none cursor-pointer"
              >
                <option value="all" className="bg-slate-800 text-white">All Roles</option>
                <option value="admin" className="bg-slate-800 text-white">Admin</option>
                <option value="officer" className="bg-slate-800 text-white">Officer</option>
                <option value="citizen" className="bg-slate-800 text-white">Citizen</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none text-lg">expand_more</span>
            </div>
            <span className="text-sm font-semibold text-white/50">Showing {paginatedUsers.length} of {filtered.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-xl">search</span>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search citizens..."
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/10 rounded-lg text-sm focus:ring-white/30 transition-all w-48 max-w-full text-white placeholder:text-white/40"
              />
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/50">
              <span className="material-symbols-outlined">download</span>
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/50">
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">User</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase text-center">Civic Score</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase text-center">Reports</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
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
                        <p className="text-sm font-semibold text-white/90">{user.displayName}</p>
                        <p className="text-xs text-white/50">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${ROLE_PILL_CLASSES[user.role] || ROLE_PILL_CLASSES.citizen}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-2xl font-bold text-cyan-300">{user.civicScore || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-white/80">{user.totalReports || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-white/50">
                      {user.createdAt?.seconds ? formatDistanceToNow(new Date(user.createdAt.seconds * 1000), { addSuffix: true }) : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block text-left">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="pl-4 pr-8 py-1.5 bg-white/10 border border-white/10 rounded-lg text-sm text-white focus:ring-white/30 appearance-none cursor-pointer"
                      >
                        <option value="citizen" className="bg-slate-800 text-white">Citizen</option>
                        <option value="officer" className="bg-slate-800 text-white">Officer</option>
                        <option value="admin" className="bg-slate-800 text-white">Admin</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none text-base">expand_more</span>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/50 text-sm">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-white/5">
          <p className="text-sm font-semibold text-white/50">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 border border-white/10 rounded-lg text-sm font-semibold transition-all ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 text-white/80'}`}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
