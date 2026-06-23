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
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="md:hidden p-2 hover:bg-black/5 rounded-lg transition-colors">
          <Menu size={20} className="text-on-surface-variant" />
        </button>
        <span className="font-headline-md text-headline-md font-bold bg-gradient-to-r from-primary to-secondary-container bg-clip-text text-transparent">CivicAI</span>
      </div>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all"
        >
          {photoURL ? (
            <img src={photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs uppercase">
              {initial}
            </div>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl p-4 shadow-xl z-50 border border-gray-200">
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-outline-variant/20">
              {photoURL ? (
                <img src={photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm uppercase shrink-0">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{name}</p>
                <p className="text-xs text-on-surface-variant truncate">{email}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                await signOut();
                navigate('/login');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-variant/50 transition-all"
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
