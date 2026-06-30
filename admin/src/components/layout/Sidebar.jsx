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
      <nav className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 flex flex-col p-4 gap-2 bg-white/20 backdrop-blur-xl border-r border-white/10 shadow-md w-64 hidden md:flex`}>
        <div className="mb-6 px-4">
          <h2 className="text-lg font-bold text-white/90">Admin Console</h2>
          <p className="text-white/40 text-[12px]">City Official Access</p>
        </div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 bg-cyan-400/10 text-cyan-300 rounded-lg px-4 py-2 translate-x-1 transition-transform'
                : 'flex items-center gap-3 text-white/60 hover:bg-white/10 rounded-lg px-4 py-2 transition-all group'
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? 'text-cyan-300' : 'group-hover:text-white/80 transition-colors'} />
                <span className="text-sm font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Mobile sidebar */}
      <nav className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-50 flex flex-col p-4 gap-2 bg-white/20 backdrop-blur-xl border-r border-white/10 shadow-md w-64 md:hidden transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-6 px-4">
          <div>
            <h2 className="text-lg font-bold text-white/90">Admin Console</h2>
            <p className="text-white/40 text-[12px]">City Official Access</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg"><X size={18} className="text-white/60" /></button>
        </div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 bg-cyan-400/10 text-cyan-300 rounded-lg px-4 py-2 translate-x-1 transition-transform'
                : 'flex items-center gap-3 text-white/60 hover:bg-white/10 rounded-lg px-4 py-2 transition-all group'
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? 'text-cyan-300' : 'group-hover:text-white/80 transition-colors'} />
                <span className="text-sm font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
