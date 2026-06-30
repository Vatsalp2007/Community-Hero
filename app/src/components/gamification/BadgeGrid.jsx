import React from 'react';
import { BADGES } from '@shared/constants.js';
import { Flag, CircleDot, Droplets, Lamp, Award, BadgeCheck, CheckCircle } from 'lucide-react';

const ICON_MAP = {
  flag: Flag, 'circle-dot': CircleDot, droplets: Droplets,
  'lamp-street': Lamp, award: Award, 'badge-check': BadgeCheck,
  'check-circle': CheckCircle
};

export default function BadgeGrid({ earnedBadgeIds = [] }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {BADGES.map((badge) => {
        const earned = earnedBadgeIds.includes(badge.id);
        const Icon = ICON_MAP[badge.icon] || Flag;
        return (
          <div key={badge.id} className={`text-center p-3 rounded-2xl border ${earned ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 bg-white/5 opacity-40'}`}>
            <Icon size={24} className={`mx-auto mb-2 ${earned ? 'text-cyan-300' : 'text-white/30'}`} />
            <p className={`text-xs font-medium ${earned ? 'text-white/80' : 'text-white/40'}`}>{badge.label}</p>
          </div>
        );
      })}
    </div>
  );
}
