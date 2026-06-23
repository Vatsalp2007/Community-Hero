import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { ISSUE_STATUSES } from '@shared/constants.js';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  pothole: '#EF4444',
  streetlight: '#F97316',
  water_leak: '#1A56DB',
  garbage: '#10B981',
  manhole: '#9333EA',
  road_damage: '#F59E0B',
  other: '#6B7280',
};

const CATEGORY_LABELS = {
  pothole: 'Pothole',
  streetlight: 'Broken Streetlight',
  water_leak: 'Water Leakage',
  garbage: 'Garbage / Waste',
  manhole: 'Open Manhole',
  road_damage: 'Road Damage',
  other: 'Other Issue',
};

function timeAgo(date) {
  if (!date) return 'Unknown';
  const seconds = Math.floor((Date.now() - (date.seconds ? date.seconds * 1000 : date.getTime())) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [last30Days, setLast30Days] = useState(false);

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const filteredIssues = last30Days
    ? issues.filter(i => {
        const t = i.createdAt?.seconds ? i.createdAt.seconds * 1000 : 0;
        return t >= thirtyDaysAgo;
      })
    : issues;

  useEffect(() => {
    const unsubIssues = onSnapshot(collection(db, 'issues'), (snap) => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubIssues(); unsubUsers(); };
  }, []);

  const totalIssues = filteredIssues.length;
  const openIssues = filteredIssues.filter(i => ['open', 'verified'].includes(i.status)).length;
  const resolvedIssues = filteredIssues.filter(i => i.status === 'resolved').length;

  const categoryCounts = Object.keys(CATEGORY_COLORS).map(key => ({
    key,
    label: CATEGORY_LABELS[key],
    color: CATEGORY_COLORS[key],
    count: filteredIssues.filter(i => i.category === key).length,
  })).filter(d => d.count > 0);

  const totalForDonut = categoryCounts.reduce((sum, d) => sum + d.count, 0);

  const buildConicGradient = () => {
    if (totalForDonut === 0) return 'transparent';
    let acc = 0;
    const segments = categoryCounts.map(d => {
      const start = acc;
      acc += (d.count / totalForDonut) * 100;
      return `${d.color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${segments.join(', ')})`;
  };

  const recentIssues = [...filteredIssues]
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .slice(0, 8);

  const statCards = [
    {
      label: 'Total Issues', value: totalIssues, icon: 'assignment',
      iconBg: 'rgba(0, 63, 177, 0.1)', iconColor: '#003fb1',
      trend: { label: '12%', up: true, color: '#ba1a1a' },
    },
    {
      label: 'Open Issues', value: openIssues, icon: 'schedule',
      iconBg: 'rgba(217, 119, 6, 0.1)', iconColor: '#d97706',
      sub: 'Requires attention',
    },
    {
      label: 'Resolved', value: resolvedIssues, icon: 'check_circle',
      iconBg: 'rgba(16, 185, 129, 0.1)', iconColor: '#10b981',
      trend: { label: 'Today', up: true, color: '#10b981' },
    },
    {
      label: 'Active Users', value: users.length, icon: 'trending_up',
      iconBg: 'rgba(147, 51, 234, 0.1)', iconColor: '#9333ea',
      sub: 'In last 5m',
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-background">Dashboard Overview</h1>
          <p className="text-on-surface-variant text-sm sm:text-base mt-1">
            Real-time civic performance metrics and issue reporting.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => setLast30Days(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              last30Days
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'glass-card text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-lg">calendar_today</span>
            {last30Days ? 'Last 30 Days' : 'All Time'}
          </button>
          <button
            onClick={() => {
              const csv = issues.map(i =>
                `"${i.trackingId || ''}","${i.title || ''}","${i.category || ''}","${i.severity || ''}","${i.status || ''}","${i.address || ''}","${i.createdAt?.seconds ? new Date(i.createdAt.seconds * 1000).toISOString() : ''}"`
              ).join('\n');
              const blob = new Blob(['Tracking ID,Title,Category,Severity,Status,Address,Created\n' + csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `civicai-issues-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success('Report downloaded');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-lg">file_download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => navigate('/issues')}
            className="glass-card p-6 rounded-xl flex flex-col justify-between min-h-[130px] cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-sm font-semibold">{card.label}</span>
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: card.iconBg }}>
                <span className="material-symbols-outlined text-xl" style={{ color: card.iconColor }}>{card.icon}</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-4xl sm:text-5xl font-extrabold text-on-surface leading-none">{card.value}</span>
              {card.trend && (
                <span className="text-sm font-semibold flex items-center" style={{ color: card.trend.color }}>
                  <span className="material-symbols-outlined text-sm">
                    {card.trend.up ? 'trending_up' : 'trending_down'}
                  </span>
                  {card.trend.label}
                </span>
              )}
              {card.sub && (
                <span className="text-on-surface-variant text-sm font-semibold opacity-60">{card.sub}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Issues by Category - 2/3 width */}
        <div className="xl:col-span-2 glass-card p-6 rounded-xl overflow-hidden min-h-[420px] flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="text-xl font-semibold text-on-surface">Issues by Category</h3>
            <button
              onClick={() => navigate('/analytics')}
              className="text-primary text-sm font-semibold hover:underline whitespace-nowrap cursor-pointer"
            >
              View Analytics
            </button>
          </div>
          <div
            onClick={() => navigate('/analytics')}
            className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 py-2 cursor-pointer"
          >
            <div
              className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 shrink-0 rounded-full flex items-center justify-center"
              style={{ background: totalForDonut > 0 ? buildConicGradient() : '#e5e7eb' }}
            >
              <div className="absolute inset-[14px] rounded-full bg-white/90 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center shadow-inner">
                <span className="text-4xl sm:text-5xl font-extrabold text-on-surface opacity-80 leading-none">{totalForDonut}</span>
                <span className="text-on-surface-variant text-[10px] uppercase tracking-widest text-center px-1 font-semibold">Total Reports</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
              {categoryCounts.map(d => (
                <div key={d.key} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.color }}></div>
                  <span className="text-sm font-semibold text-on-surface-variant whitespace-nowrap">{d.label}: {d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Issues Feed - 1/3 width */}
        <div className="xl:col-span-1 glass-card p-6 rounded-xl overflow-hidden flex flex-col min-h-[420px]">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="text-xl font-semibold text-on-surface">Recent Issues</h3>
            <span className="bg-primary/10 text-primary text-xs px-2.5 py-[3px] rounded-full font-semibold whitespace-nowrap">Live</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar min-h-0">
            {recentIssues.length === 0 && (
              <p className="text-on-surface-variant text-base text-center py-8 opacity-60">No issues yet</p>
            )}
            {recentIssues.map(issue => {
              const catColor = CATEGORY_COLORS[issue.category] || '#6B7280';
              const statusInfo = ISSUE_STATUSES[issue.status];
              return (
                <div key={issue.id} onClick={() => navigate(`/issues/${issue.id}`)} className="flex gap-3 p-3 rounded-xl hover:bg-white/50 transition-all cursor-pointer group">
                  <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center font-bold text-sm"
                    style={{ backgroundColor: catColor + '15', color: catColor }}>
                    {issue.severity || '-'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                      {issue.title || 'Untitled Issue'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {issue.status === 'verified' ? (
                        <span className="bg-primary/10 text-primary px-2 py-[1px] rounded-full text-[10px] font-bold">Community Verified</span>
                      ) : issue.severity === 5 ? (
                        <span className="text-error text-xs font-bold">Critical</span>
                      ) : (
                        <span className="text-on-surface-variant text-xs">{statusInfo?.label || issue.status}</span>
                      )}
                      <span className="text-on-surface-variant text-xs opacity-40 hidden sm:inline">•</span>
                      <span className="text-on-surface-variant text-xs">{timeAgo(issue.createdAt)}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity self-center">chevron_right</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
