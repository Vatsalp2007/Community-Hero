import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import IssueMap from '../components/map/IssueMap';
import { useGeolocation } from '../hooks/useGeolocation';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { formatDistanceToNow } from 'date-fns';

const STATUS_STYLES = {
  critical: { bg: 'bg-red-500/10 text-red-600', label: 'Critical', dot: 'bg-red-500' },
  open: { bg: 'bg-blue-500/10 text-blue-600', label: 'Reported', dot: 'bg-blue-500' },
  reported: { bg: 'bg-blue-500/10 text-blue-600', label: 'Reported', dot: 'bg-blue-500' },
  verified: { bg: 'bg-purple-500/10 text-purple-600', label: 'Community Verified', dot: 'bg-purple-500' },
  assigned: { bg: 'bg-orange-500/10 text-orange-600', label: 'In Progress', dot: 'bg-orange-500' },
  in_progress: { bg: 'bg-orange-500/10 text-orange-600', label: 'In Progress', dot: 'bg-orange-500' },
  resolved: { bg: 'bg-green-500/10 text-green-600', label: 'Resolved', dot: 'bg-green-500' },
};

const SEVERITY_ORDER = { critical: 0, reported: 1, open: 2, verified: 3, assigned: 4, in_progress: 5, resolved: 6 };

export default function HomePage() {
  const [issues, setIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const mapRef = useRef(null);
  const { location, requestPermission } = useGeolocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, 'issues'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => {
        const aOrder = SEVERITY_ORDER[a.status] ?? 99;
        const bOrder = SEVERITY_ORDER[b.status] ?? 99;
        if (aOrder !== bOrder) return aOrder - bOrder;
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
      setIssues(list);
    });
    return () => unsubscribe();
  }, []);

  const filteredIssues = searchQuery
    ? issues.filter(i =>
        i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.address?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : issues;

  const criticalCount = issues.filter(i => i.status === 'critical' || i.severity >= 4).length;
  const openCount = issues.filter(i => i.status === 'open' || i.status === 'reported' || i.status === 'verified').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;

  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const handleZoomIn = () => {
    const map = mapRef.current;
    if (map) map.setZoom((map.getZoom() || 13) + 1);
  };
  const handleZoomOut = () => {
    const map = mapRef.current;
    if (map) map.setZoom((map.getZoom() || 13) - 1);
  };
  const handleMyLocation = () => {
    const map = mapRef.current;
    if (location && map) {
      map.panTo({ lat: location.lat, lng: location.lng });
      map.setZoom(15);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 relative">
      {/* Full-screen dark map */}
      <div className="absolute inset-0 top-0 left-0 w-full z-0">
        <IssueMap center={location} userLocation={location} onMapLoad={handleMapLoad} />
      </div>

      {/* Desktop: Floating Sidebar */}
      <aside className="hidden md:flex absolute top-[96px] left-6 w-[340px] z-10 flex-col pointer-events-none" style={{ height: 'calc(100vh - 160px)' }}>
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden pointer-events-auto h-full border border-white/10">
          {/* Search */}
          <div className="p-4 pb-3">
            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl h-14 px-4 border border-white/10 shadow-sm focus-within:ring-2 focus-within:ring-white/30 focus-within:border-white/30 transition-all">
              <span className="material-symbols-outlined text-white/50 mr-3">search</span>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:outline-none w-full text-sm font-medium placeholder:text-white/40 text-white"
                placeholder="Search nearby issues..."
                type="text"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-white/50 text-lg">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Issue count header */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-white/10">
            <h2 className="text-base font-semibold text-white/90">{filteredIssues.length} Nearby Issues</h2>
            <span className="bg-white/10 text-white/80 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" />
              Updated Live
            </span>
          </div>

          {/* Scrollable issue cards */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin" style={{ scrollbarWidth: 'thin' }}>
            {filteredIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/40 py-12">
                <span className="material-symbols-outlined text-5xl mb-3">search_off</span>
                <p className="text-sm font-medium text-white/60">No issues found</p>
                <p className="text-xs mt-1 text-white/40">Try adjusting your search</p>
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const style = STATUS_STYLES[issue.status] || STATUS_STYLES.open;
                return (
                  <div
                    key={issue.id}
                    onClick={() => navigate(`/issues/${issue.id}`)}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 cursor-pointer group transition-all duration-200 hover:bg-white/20 hover:border-white/30 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${style.bg}`}>
                        {style.label}
                      </span>
                      <span className="text-[11px] text-white/40 font-medium whitespace-nowrap ml-2">
                        {issue.createdAt
                          ? formatDistanceToNow(new Date(issue.createdAt.seconds ? issue.createdAt.seconds * 1000 : issue.createdAt), { addSuffix: true })
                          : ''}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white/90 mb-1 group-hover:text-white transition-colors leading-snug">
                      {issue.title}
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed line-clamp-2 mb-2.5">
                      {issue.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-white/40">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      <span className="text-[11px] truncate">{issue.address || 'Location pinned'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* Map control spacer (desktop) */}
      <div className="hidden md:block absolute top-6 left-[380px] right-0 z-10 pointer-events-none" />

      {/* Floating map controls (bottom-right) */}
      <div className="absolute bottom-[140px] right-6 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-[20px] rounded-2xl shadow-[0_8px_20px_-6px_rgba(0,0,0,0.2)] p-1.5 flex flex-col items-center gap-0.5 pointer-events-auto border border-white/30">
          <button
            onClick={handleZoomIn}
            className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all active:scale-90 text-gray-700"
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
          <div className="w-6 h-px bg-gray-200" />
          <button
            onClick={handleZoomOut}
            className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all active:scale-90 text-gray-700"
          >
            <span className="material-symbols-outlined text-xl">remove</span>
          </button>
        </div>
        <button
          onClick={handleMyLocation}
          className="w-11 h-11 bg-white/90 backdrop-blur-[20px] rounded-2xl shadow-[0_8px_20px_-6px_rgba(0,0,0,0.2)] flex items-center justify-center hover:bg-white transition-all active:scale-90 text-primary pointer-events-auto border border-white/30"
        >
          <span className="material-symbols-outlined text-xl">my_location</span>
        </button>
        <button className="w-11 h-11 bg-white/90 backdrop-blur-[20px] rounded-2xl shadow-[0_8px_20px_-6px_rgba(0,0,0,0.2)] flex items-center justify-center hover:bg-white transition-all active:scale-90 text-gray-600 pointer-events-auto border border-white/30">
          <span className="material-symbols-outlined text-xl">layers</span>
        </button>
      </div>

      {/* FAB - Report Issue */}
      <div className="absolute bottom-20 md:bottom-16 right-6 z-10 pointer-events-none">
        <button
          onClick={() => navigate('/report')}
          className="pointer-events-auto bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white flex items-center gap-2.5 pl-5 pr-6 py-3 rounded-full shadow-[0_8px_25px_-5px_rgba(26,86,219,0.4)] hover:shadow-[0_12px_35px_-5px_rgba(26,86,219,0.5)] hover:scale-[1.03] active:scale-95 transition-all duration-300"
        >
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          <span className="text-sm font-semibold tracking-wide">Report Issue</span>
        </button>
      </div>

      {/* Desktop: Bottom Status Legend */}
      <div className="hidden md:flex absolute bottom-0 left-0 right-0 h-12 bg-white/20 backdrop-blur-md border-t border-white/10 z-10 items-center px-8 justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(220,38,38,0.4)]" />
            <span className="text-[12px] font-medium text-white/80">Critical ({criticalCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(37,99,235,0.4)]" />
            <span className="text-[12px] font-medium text-white/80">Open ({openCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(22,163,74,0.4)]" />
            <span className="text-[12px] font-medium text-white/80">Resolved ({resolvedCount})</span>
          </div>
        </div>
        <span className="text-[11px] text-white/50 font-medium">Ahmedabad, India</span>
      </div>

      {/* Mobile: Bottom sheet trigger + sheet */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
        {/* Trigger bar */}
        <button
          onClick={() => setMobileSheetOpen(true)}
          className="pointer-events-auto mx-auto mb-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg px-5 py-2.5 flex items-center gap-2 border border-white/30"
        >
          <span className="material-symbols-outlined text-primary text-lg">list</span>
          <span className="text-sm font-medium text-gray-700">{filteredIssues.length} Nearby Issues</span>
          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary font-semibold rounded-full">{criticalCount}</span>
        </button>
      </div>

      {/* Mobile: Bottom Sheet overlay */}
      {mobileSheetOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileSheetOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[75vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800 text-base">Nearby Issues</h3>
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary font-semibold rounded-full">{filteredIssues.length}</span>
              </div>
              <button onClick={() => setMobileSheetOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <span className="material-symbols-outlined text-gray-500 text-lg">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredIssues.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <span className="material-symbols-outlined text-5xl mb-2">search_off</span>
                  <p className="text-sm font-medium">No issues found</p>
                </div>
              ) : (
                filteredIssues.map((issue) => {
                  const style = STATUS_STYLES[issue.status] || STATUS_STYLES.open;
                  return (
                    <div
                      key={issue.id}
                      onClick={() => { setMobileSheetOpen(false); navigate(`/issues/${issue.id}`); }}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${style.bg}`}>
                          {style.label}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {issue.createdAt
                            ? formatDistanceToNow(new Date(issue.createdAt.seconds ? issue.createdAt.seconds * 1000 : issue.createdAt), { addSuffix: true })
                            : ''}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800 mb-0.5">{issue.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1 mb-1.5">{issue.description}</p>
                      <div className="flex items-center gap-1 text-gray-400">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span className="text-[10px] truncate">{issue.address || 'Location pinned'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
