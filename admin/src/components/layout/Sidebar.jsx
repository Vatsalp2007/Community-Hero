import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Map, BarChart3, Users, X } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/issues', icon: AlertTriangle, label: 'Issues' },
  { to: '/map', icon: Map, label: 'Map View' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/users', icon: Users, label: 'Users' },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}
      <nav className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 flex flex-col p-4 gap-2 bg-white/70 backdrop-blur-xl border-r border-white/20 shadow-md w-64 hidden md:flex`}>
        <div className="mb-6 px-4">
          <h2 className="font-headline-md text-headline-md font-bold text-primary">Admin Console</h2>
          <p className="text-on-surface-variant text-[12px] opacity-70">City Official Access</p>
        </div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 bg-primary/10 text-primary rounded-lg px-4 py-2 translate-x-1 transition-transform'
                : 'flex items-center gap-3 text-on-surface-variant hover:bg-surface-variant/50 rounded-lg px-4 py-2 transition-all group'
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? '' : 'group-hover:text-primary transition-colors'} />
                <span className="font-label-md text-label-md">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Mobile sidebar */}
      <nav className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-50 flex flex-col p-4 gap-2 bg-white/70 backdrop-blur-xl border-r border-white/20 shadow-md w-64 md:hidden transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-6 px-4">
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-primary">Admin Console</h2>
            <p className="text-on-surface-variant text-[12px] opacity-70">City Official Access</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-variant/50 rounded-lg"><X size={18} className="text-on-surface-variant" /></button>
        </div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 bg-primary/10 text-primary rounded-lg px-4 py-2 translate-x-1 transition-transform'
                : 'flex items-center gap-3 text-on-surface-variant hover:bg-surface-variant/50 rounded-lg px-4 py-2 transition-all group'
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? '' : 'group-hover:text-primary transition-colors'} />
                <span className="font-label-md text-label-md">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
