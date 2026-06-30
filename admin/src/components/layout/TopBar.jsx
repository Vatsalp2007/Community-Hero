import React, { useState, useRef, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { signOut } from '@shared/auth.js';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ onMenuToggle, user, profile }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const name = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Admin';
  const email = profile?.email || user?.email || '';
  const initial = name.charAt(0).toUpperCase();
  const photoURL = user?.photoURL || profile?.photoURL;

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/20 backdrop-blur-xl border-b border-white/10 shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Menu size={20} className="text-white/60" />
        </button>
        <span className="text-lg font-bold bg-gradient-to-r from-blue-200 to-blue-50 bg-clip-text text-transparent">JANSETU AI</span>
      </div>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-all"
        >
          {photoURL ? (
            <img src={photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-300 font-bold text-xs uppercase">
              {initial}
            </div>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white/20 backdrop-blur-xl rounded-xl p-4 shadow-xl z-50 border border-white/10">
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
              {photoURL ? (
                <img src={photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-300 font-bold text-sm uppercase shrink-0">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-white/90 truncate">{name}</p>
                <p className="text-xs text-white/50 truncate">{email}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                await signOut();
                navigate('/login');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white/70 hover:bg-white/10 transition-all"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
