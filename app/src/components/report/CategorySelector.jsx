import React from 'react';
import { ISSUE_CATEGORIES } from '@shared/constants.js';
import { Check } from 'lucide-react';

export default function CategorySelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(ISSUE_CATEGORIES).map(([key, cat]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
            selected === key
              ? 'border-cyan-400 bg-cyan-400/20'
              : 'border-white/10 hover:border-white/30 bg-white/10'
          }`}
        >
          <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + '25' }}>
            <span className="text-sm" style={{ color: cat.color }}>●</span>
          </span>
          <span className="text-sm font-medium text-white/80">{cat.label}</span>
          {selected === key && <Check size={14} className="text-cyan-300 ml-auto" />}
        </button>
      ))}
    </div>
  );
}
