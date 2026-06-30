import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS, DEPARTMENTS } from '@shared/constants.js';

const SEVERITY_COLORS = {
  1: { name: 'Low', color: 'bg-cyan-400/20', textColor: 'text-cyan-300' },
  2: { name: 'Minor', color: 'bg-lime-400/20', textColor: 'text-lime-300' },
  3: { name: 'Moderate', color: 'bg-amber-400/20', textColor: 'text-amber-300' },
  4: { name: 'High', color: 'bg-orange-400/20', textColor: 'text-orange-300' },
  5: { name: 'Critical', color: 'bg-red-400/20', textColor: 'text-red-300' },
};

const STATUS_OPACITY = {
  open: '',
  verified: 'opacity-80',
  in_progress: 'opacity-60',
  resolved: 'opacity-40',
  rejected: '',
};

export default function AnalyticsPage() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'issues'), (snap) => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const categoryData = Object.entries(ISSUE_CATEGORIES).map(([key, cat]) => ({
    key,
    name: cat.label,
    count: issues.filter(i => i.category === key).length,
  }));

  const maxCategory = Math.max(...categoryData.map(c => c.count), 1);

  const severityData = Object.entries(SEVERITY_LEVELS).map(([level, info]) => ({
    level: Number(level),
    name: info.label,
    count: issues.filter(i => i.severity === Number(level)).length,
    color: info.color,
  }));

  const totalSeverity = severityData.reduce((sum, s) => sum + s.count, 0);

  const statusData = [
    { key: 'open', name: 'Open', count: issues.filter(i => i.status === 'open').length },
    { key: 'verified', name: 'Verified', count: issues.filter(i => i.status === 'verified').length },
    { key: 'in_progress', name: 'In Progress', count: issues.filter(i => i.status === 'in_progress').length },
    { key: 'resolved', name: 'Resolved', count: issues.filter(i => i.status === 'resolved').length },
    { key: 'rejected', name: 'Rejected', count: issues.filter(i => i.status === 'rejected').length },
  ];

  const maxStatus = Math.max(...statusData.map(s => s.count), 1);
  const maxHeight = 200;

  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  const openCount = issues.filter(i => ['open', 'verified'].includes(i.status)).length;
  const inProgressCount = issues.filter(i => i.status === 'in_progress').length;
  const rejectedCount = issues.filter(i => i.status === 'rejected').length;

  const handleExportCSV = () => {
    const csv = issues.map(i => `"${i.trackingId}","${i.title}","${i.category}","${i.severity}","${i.status}","${i.address || ''}","${i.createdAt?.seconds ? new Date(i.createdAt.seconds * 1000).toISOString() : ''}"`).join('\n');
    const blob = new Blob(['Tracking ID,Title,Category,Severity,Status,Address,Created\n' + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'issues.csv';
    a.click();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white/90">Analytics Overview</h1>
          <p className="text-white/60 text-sm sm:text-base">Real-time governance performance and issue distribution metrics.</p>
        </div>
        <button onClick={handleExportCSV} className="civic-gradient text-white text-sm font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:scale-105 transition-all shrink-0">
          <span className="material-symbols-outlined text-lg">download</span>
          Export CSV
        </button>
      </div>

      {/* Top Row: Category Bars + Status Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Issues by Category - Horizontal Bar Chart */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white/90">Issues by Category</h3>
            <span className="material-symbols-outlined text-white/40">more_vert</span>
          </div>
          <div className="space-y-4">
            {categoryData.map((cat) => (
              <div key={cat.key} className="space-y-1.5">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-white/80">{cat.name}</span>
                  <span className="text-white/60">{cat.count}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div
                    className="civic-gradient h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(cat.count / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issues by Status - Column Chart */}
        <div className="glass-card p-6 rounded-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white/90">Issues by Status</h3>
          </div>
          <div className="flex-1 flex items-end justify-around gap-4 pt-4 border-b border-white/10">
            {statusData.map((status) => (
              <div key={status.key} className="flex flex-col items-center gap-2 flex-1">
                <span className="text-sm font-bold text-cyan-300">{status.count}</span>
                <div
                  className={`w-full civic-gradient rounded-t-lg transition-all duration-1000 hover:brightness-110 ${STATUS_OPACITY[status.key]}`}
                  style={{
                    height: status.count === 0 ? '4px' : `${Math.max((status.count / maxStatus) * maxHeight, 4)}px`,
                    background: status.count === 0 ? 'rgba(255,255,255,0.05)' : undefined,
                  }}
                />
                <span className="text-xs font-semibold text-white/50 truncate">{status.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Severity Donut + Summary Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Severity Distribution - SVG Donut */}
        <div className="glass-card p-6 rounded-xl">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white/90">Severity Distribution</h3>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 min-h-[200px]">
            <div className="relative w-48 h-48 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="100, 100"
                  strokeWidth="3"
                />
                {(() => {
                  if (totalSeverity === 0) return null;
                  let offset = 0;
                  const strokeColors = {
                    1: 'text-cyan-400',
                    2: 'text-lime-400',
                    3: 'text-amber-400',
                    4: 'text-orange-400',
                    5: 'text-red-400',
                  };
                  return severityData.map((s) => {
                    if (s.count === 0) return null;
                    const pct = (s.count / totalSeverity) * 100;
                    const el = (
                      <path
                        key={s.level}
                        className={strokeColors[s.level]}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray={`${pct}, 100`}
                        strokeDashoffset={-offset}
                        strokeWidth="3"
                      />
                    );
                    offset += pct;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white/90">{totalSeverity}</span>
                <span className="text-xs uppercase tracking-widest text-white/50 font-semibold">Reports</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              {severityData.map((s) => (
                  <div key={s.level} className={`flex items-center gap-2 ${s.count === 0 ? 'opacity-50' : ''}`}>
                    <span className={`w-3 h-3 rounded-full shrink-0 ${SEVERITY_COLORS[s.level].color}`} />
                    <span className="text-sm font-semibold text-white/80">{s.name}: {s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white/90">Total Issues: {issues.length}</h3>
            <span className="material-symbols-outlined text-white/40">history</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-cyan-400/10 border border-cyan-400/20 rounded-xl p-6 flex flex-col items-center justify-center transition-all hover:scale-105">
              <span className="text-3xl font-extrabold text-cyan-300">{resolvedCount}</span>
              <span className="text-xs font-bold text-cyan-300/70 uppercase tracking-wider">Resolved</span>
            </div>
            <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-6 flex flex-col items-center justify-center transition-all hover:scale-105">
              <span className="text-3xl font-extrabold text-amber-300">{openCount}</span>
              <span className="text-xs font-bold text-amber-300/70 uppercase tracking-wider">Open</span>
            </div>
            <div className="bg-blue-400/10 border border-blue-400/20 rounded-xl p-6 flex flex-col items-center justify-center transition-all hover:scale-105">
              <span className="text-3xl font-extrabold text-blue-300">{inProgressCount}</span>
              <span className="text-xs font-bold text-blue-300/70 uppercase tracking-wider">In Progress</span>
            </div>
            <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-6 flex flex-col items-center justify-center transition-all hover:scale-105">
              <span className="text-3xl font-extrabold text-red-300">{rejectedCount}</span>
              <span className="text-xs font-bold text-red-300/70 uppercase tracking-wider">Rejected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
