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
          <div key={badge.id} className={`text-center p-3 rounded-2xl border ${earned ? 'border-primary bg-primary-light' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
            <Icon size={24} className={`mx-auto mb-2 ${earned ? 'text-primary' : 'text-gray-400'}`} />
            <p className={`text-xs font-medium ${earned ? 'text-gray-900' : 'text-gray-500'}`}>{badge.label}</p>
          </div>
        );
      })}
    </div>
  );
}
