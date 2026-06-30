import React from 'react';
import { CIVIC_SCORE_EVENTS, LEVEL_THRESHOLDS, BADGES } from '@shared/constants.js';
import { calculateLevel } from '@shared/firestore.js';

const LEVEL_META = {
  bronze: { label: 'Bronze', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', bar: 'bg-amber-400' },
  silver: { label: 'Silver', color: 'text-gray-300', bg: 'bg-gray-300/10', border: 'border-gray-300/20', bar: 'bg-gray-300' },
  gold: { label: 'Gold', color: 'text-yellow-300', bg: 'bg-yellow-300/10', border: 'border-yellow-300/20', bar: 'bg-yellow-300' },
  platinum: { label: 'Platinum', color: 'text-purple-300', bg: 'bg-purple-300/10', border: 'border-purple-300/20', bar: 'bg-purple-300' },
  hero: { label: 'Hero', color: 'text-pink-300', bg: 'bg-pink-300/10', border: 'border-pink-300/20', bar: 'bg-pink-300' },
};

const EVENT_ICONS = {
  report_accepted: 'note_add',
  report_verified: 'verified',
  report_resolved: 'check_circle',
  upvote_verified: 'thumb_up',
  moderator_verify: 'admin_panel_settings',
  streak_bonus: 'local_fire_department',
  first_in_ward: 'emoji_events',
};

const EVENT_COLORS = {
  report_accepted: 'text-blue-300',
  report_verified: 'text-cyan-300',
  report_resolved: 'text-green-300',
  upvote_verified: 'text-amber-300',
  moderator_verify: 'text-purple-300',
  streak_bonus: 'text-orange-300',
  first_in_ward: 'text-yellow-300',
};

const levels = Object.entries(LEVEL_THRESHOLDS);

export default function GamificationGuide({ userScore = 0 }) {
  const userLevel = calculateLevel(userScore);

  return (
    <div className="bg-white/20 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-cyan-300 text-xl">info</span>
        <h3 className="text-base font-bold text-white/90">How Civic Scoring Works</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Level Tiers */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="material-symbols-outlined text-base text-white/60">stairs</span>
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">Level Tiers</span>
          </div>
          <div className="space-y-1.5">
            {levels.map(([key, minScore], idx) => {
              const meta = LEVEL_META[key];
              const nextScore = idx < levels.length - 1 ? levels[idx + 1][1] : null;
              const isUserLevel = key === userLevel;
              return (
                <div key={key} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${isUserLevel ? meta.border + ' ' + meta.bg : 'border-white/5'} transition-all`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${meta.bar} ${isUserLevel ? 'ring-2 ring-white/30' : ''}`} />
                    <span className={`text-sm font-semibold ${isUserLevel ? meta.color : 'text-white/60'}`}>
                      {meta.label}
                    </span>
                    {isUserLevel && (
                      <span className="text-[10px] font-bold text-cyan-300 bg-cyan-400/10 px-1.5 py-0.5 rounded-full">You</span>
                    )}
                  </div>
                  <span className="text-xs text-white/40">{minScore}+ pts</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Earning Points */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="material-symbols-outlined text-base text-white/60">add_card</span>
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">How to Earn</span>
          </div>
          <div className="space-y-1.5">
            {Object.entries(CIVIC_SCORE_EVENTS).map(([event, points]) => (
              <div key={event} className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/5 hover:bg-white/5 transition-all">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-base ${EVENT_COLORS[event] || 'text-white/60'}`}>{EVENT_ICONS[event] || 'stars'}</span>
                  <span className="text-xs text-white/70 capitalize leading-tight">
                    {event.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-xs font-bold text-cyan-300">+{points}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Badges */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="material-symbols-outlined text-base text-white/60">military_tech</span>
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">Available Badges</span>
          </div>
          <div className="space-y-1.5">
            {BADGES.map((badge) => (
              <div key={badge.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/5 hover:bg-white/5 transition-all">
                <span className="material-symbols-outlined text-base text-cyan-300 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white/80">{badge.label}</p>
                  <p className="text-[10px] text-white/40 truncate">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}