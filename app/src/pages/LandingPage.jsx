import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Users, MapPin, ArrowRight } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { useAuth } from '../hooks/useAuth';

export default function LandingPage() {
  const [stats, setStats] = useState({ total: 0, resolved: 0, cities: 3 });
  const { user, loading } = useAuth();

  useEffect(() => {
    async function fetchStats() {
      try {
        const snap = await getDocs(collection(db, 'issues'));
        const total = snap.size;
        const resolved = snap.docs.filter(d => d.data().status === 'resolved').length;
        setStats({ total, resolved, cities: 3 });
      } catch (e) { /* ignore */ }
    }
    fetchStats();
  }, []);

  const authButton = loading ? null : user ? (
    <Link to="/home" className="px-5 py-2.5 text-sm font-medium rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #1A56DB, #06B6D4)' }}>
      Go to Dashboard
    </Link>
  ) : (
    <Link to="/login" className="px-5 py-2.5 text-sm font-medium rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #1A56DB, #06B6D4)' }}>
      Get Started
    </Link>
  );

  const mainCta = loading ? null : user ? (
    <Link to="/home" className="px-6 py-3 text-white font-semibold rounded-xl shadow-lg flex items-center gap-2 hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #1A56DB, #06B6D4)' }}>
      Go to Map <ArrowRight size={18} />
    </Link>
  ) : (
    <Link to="/login" className="px-6 py-3 text-white font-semibold rounded-xl shadow-lg flex items-center gap-2 hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #1A56DB, #06B6D4)' }}>
      Get Started <ArrowRight size={18} />
    </Link>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      {/* Atmospheric background effects */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.12]" style={{ background: 'radial-gradient(circle, #003fb1, transparent)' }} />
        <div className="absolute bottom-[-10%] right-[-15%] w-[500px] h-[500px] rounded-full opacity-[0.15]" style={{ background: 'radial-gradient(circle, #57dffe, transparent)' }} />
        <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] rounded-full opacity-[0.08]" style={{ background: 'radial-gradient(circle, #1A56DB, transparent)' }} />
      </div>

      <nav className="flex items-center justify-between px-6 py-4 bg-white/20 backdrop-blur-xl border-b border-white/10">
        <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-50">JANSETU AI</span>
        {authButton}
      </nav>

      <section className="px-6 pt-24 pb-20 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white/90 leading-tight">
          Report. Verify. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-50">Resolve.</span> Together.
        </h1>
        <p className="mt-6 text-lg text-white/60 max-w-xl mx-auto">
          AI-powered hyperlocal civic issue reporting. Snap a photo, let AI classify it, community verifies, and authorities resolve.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          {mainCta}
          <Link to="/home" className="px-6 py-3 font-semibold rounded-xl bg-white/20 backdrop-blur-xl border border-white/10 text-white/80 shadow-sm hover:bg-white/30 hover:border-white/30 hover:shadow-lg transition-all duration-300">
            See Issues Near You
          </Link>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="max-w-4xl mx-auto rounded-xl bg-white/20 backdrop-blur-xl border border-white/10 shadow-sm px-8 py-6">
          <div className="flex items-center justify-around text-center">
            <div>
              <div className="text-3xl font-bold text-blue-300">{stats.total}+</div>
              <div className="text-sm text-white/50 mt-1">Issues Reported</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <div className="text-3xl font-bold text-blue-300">{stats.resolved}+</div>
              <div className="text-sm text-white/50 mt-1">Resolved</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <div className="text-3xl font-bold text-blue-300">{stats.cities}</div>
              <div className="text-sm text-white/50 mt-1">Cities Active</div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="rounded-xl p-6 text-center bg-white/20 backdrop-blur-xl border border-white/10 shadow-sm hover:bg-white/30 hover:border-white/30 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
              <Camera size={24} className="text-blue-300" />
            </div>
            <h3 className="font-bold text-white/90 mb-2">Smart Reporting</h3>
            <p className="text-sm text-white/60">Snap a photo and our AI instantly classifies the issue type, severity, and department.</p>
          </div>
          <div className="rounded-xl p-6 text-center bg-white/20 backdrop-blur-xl border border-white/10 shadow-sm hover:bg-white/30 hover:border-white/30 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(45, 212, 191, 0.2)' }}>
              <Users size={24} className="text-teal-300" />
            </div>
            <h3 className="font-bold text-white/90 mb-2">Community Verified</h3>
            <p className="text-sm text-white/60">Upvote real issues to verify them. When 5 citizens confirm, the issue gets priority.</p>
          </div>
          <div className="rounded-xl p-6 text-center bg-white/20 backdrop-blur-xl border border-white/10 shadow-sm hover:bg-white/30 hover:border-white/30 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(251, 146, 60, 0.2)' }}>
              <MapPin size={24} className="text-orange-300" />
            </div>
            <h3 className="font-bold text-white/90 mb-2">Real-time Tracking</h3>
            <p className="text-sm text-white/60">Watch your reported issue move from open to resolved on an interactive map.</p>
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 border-t border-white/10 text-center">
        <p className="text-sm text-white/40">JANSETU AI - Empowering citizens to build better communities</p>
      </footer>
    </div>
  );
}
