import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const TABS = [
  { to: '/home', label: 'Map', icon: 'map' },
  { to: '/my-reports', label: 'Reports', icon: 'assignment' },
  { to: '/report', label: 'Report', icon: 'add', center: true },
  { to: '/leaderboard', label: 'Rank', icon: 'leaderboard' },
  { to: '/profile', label: 'Profile', icon: 'person' },
];

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/70 backdrop-blur-xl border-t border-white/20 h-16 flex items-center justify-around px-gutter z-50">
      {TABS.map(({ to, label, icon, center }) => {
        const active = isActive(to);
        if (center) {
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center -mt-8"
            >
              <div className="h-14 w-14 rounded-full bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-2xl text-white">add</span>
              </div>
              <span className="text-[10px] font-bold text-label-md text-primary">{label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-1 transition-colors ${
              active ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span className="text-[10px] font-bold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
