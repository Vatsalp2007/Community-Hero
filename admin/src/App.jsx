import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import { onAuthChange, getUserProfile } from '@shared/auth.js';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import { LayoutDashboard, AlertTriangle, Map, BarChart3, Users } from 'lucide-react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import IssuesPage from './pages/IssuesPage';
import IssueDetailPage from './pages/IssueDetailPage';
import MapPage from './pages/MapPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UsersPage from './pages/UsersPage';

const queryClient = new QueryClient();

const mobileNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/issues', icon: AlertTriangle, label: 'Issues' },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/users', icon: Users, label: 'Users' },
];

function MobileBottomNav() {
  const location = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/70 backdrop-blur-xl border-t border-white/20 h-16 flex justify-around items-center px-4 z-50">
      {mobileNav.map(item => {
        const isActive = location.pathname === item.to;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <item.icon size={20} />
            <span className={`text-[10px] ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function AdminLayout({ children, fullBleed = false, user, profile }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-surface">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-0">
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} user={user} profile={profile} />
        {fullBleed ? (
          <main className="flex-1 min-h-0 overflow-hidden pt-16 pl-0 md:pl-72">
            {children}
          </main>
        ) : (
          <main className="flex-1 min-h-0 overflow-y-auto pt-24 pb-24 px-6 pl-0 md:pl-72 md:pb-6">
            <div className="w-full">{children}</div>
          </main>
        )}
        <MobileBottomNav />
      </div>
    </div>
  );
}

function ProtectedAdminRoute({ children, fullBleed = false }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const welcomed = useRef(false);

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (u) {
        setUser(u);
        const p = await getUserProfile(u.uid);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (profile && !welcomed.current) {
      welcomed.current = true;
      const name = profile.displayName || user?.email?.split('@')[0] || 'Admin';
      toast.success(`Welcome, ${name}`);
    }
  }, [profile, user]);

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (profile && !['officer', 'admin'].includes(profile.role)) {
    return <div className="flex items-center justify-center h-screen flex-col gap-4"><h1 className="text-headline-lg font-bold text-error">Access Denied</h1><p className="text-body-md text-on-surface-variant">You need officer or admin privileges.</p></div>;
  }
  return <AdminLayout fullBleed={fullBleed} user={user} profile={profile}>{children}</AdminLayout>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedAdminRoute><DashboardPage /></ProtectedAdminRoute>} />
            <Route path="/issues" element={<ProtectedAdminRoute><IssuesPage /></ProtectedAdminRoute>} />
            <Route path="/issues/:issueId" element={<ProtectedAdminRoute><IssueDetailPage /></ProtectedAdminRoute>} />
            <Route path="/map" element={<ProtectedAdminRoute fullBleed><MapPage /></ProtectedAdminRoute>} />
            <Route path="/analytics" element={<ProtectedAdminRoute><AnalyticsPage /></ProtectedAdminRoute>} />
            <Route path="/users" element={<ProtectedAdminRoute><UsersPage /></ProtectedAdminRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
