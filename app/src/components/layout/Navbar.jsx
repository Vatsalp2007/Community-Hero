import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NAV_LINKS = [
  { to: '/home', label: 'Map', authOnly: false },
  { to: '/report', label: 'Report', authOnly: true },
  { to: '/my-reports', label: 'My Reports', authOnly: true },
  { to: '/leaderboard', label: 'Leaderboard', authOnly: false },
  { to: '/profile', label: 'Profile', authOnly: true },
];

export default function Navbar() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-[72px] bg-white/20 backdrop-blur-xl border-b border-white/10 shadow-sm">
      <div className="flex items-center gap-10">
        <Link to="/" className="font-headline-md text-headline-md font-bold bg-gradient-to-r from-blue-200 to-blue-50 bg-clip-text text-transparent drop-shadow-md">
          JANSETU AI
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ to, label, authOnly }) => {
            if (authOnly && !user) return null;
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`font-label-md text-label-md transition-all duration-200 ${
                  isActive
                    ? 'text-primary font-bold drop-shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {!loading && user ? (
          <>
            <Link to="/profile">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-md overflow-hidden transition-transform hover:scale-105">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold">{user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}</span>
                )}
              </div>
            </Link>
          </>
        ) : !loading ? (
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-md"
          >
            Get Started
          </button>
        ) : null}
      </div>
    </header>
  );
}
