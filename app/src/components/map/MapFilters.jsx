import React from 'react';
import { X } from 'lucide-react';
import { ISSUE_CATEGORIES, ISSUE_STATUSES, SEVERITY_LEVELS } from '@shared/constants.js';

export default function MapFilters({ filters, onFilterChange, onClose }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(ISSUE_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => onFilterChange('category', filters.category === key ? null : key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.category === key ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={filters.category === key ? { backgroundColor: cat.color } : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Status</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(ISSUE_STATUSES).map(([key, status]) => (
            <button
              key={key}
              onClick={() => onFilterChange('status', filters.status === key ? null : key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.status === key ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={filters.status === key ? { backgroundColor: status.color } : {}}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Severity</p>
        <div className="flex gap-1.5">
          {Object.entries(SEVERITY_LEVELS).map(([level, info]) => (
            <button
              key={level}
              onClick={() => onFilterChange('severity', filters.severity === Number(level) ? null : Number(level))}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                filters.severity === Number(level) ? 'text-white ring-2 ring-offset-1' : 'text-gray-600'
              }`}
              style={{
                backgroundColor: filters.severity === Number(level) ? info.color : info.color + '20',
                ringColor: info.color
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
