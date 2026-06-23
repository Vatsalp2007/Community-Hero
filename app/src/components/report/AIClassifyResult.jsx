import React from 'react';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS } from '@shared/constants.js';
import { Sparkles, Pencil, AlertTriangle } from 'lucide-react';

export default function AIClassifyResult({ classification, onChangeCategory }) {
  if (!classification || classification.confidence === 0) {
    return (
      <div className="bg-amber-500/10 border border-amber-400/20 rounded-2xl p-4 flex items-center gap-3">
        <AlertTriangle size={20} className="text-amber-300" />
        <div>
          <p className="text-sm font-medium text-amber-200">Manual classification required</p>
          <p className="text-xs text-amber-300/80">AI could not analyze the image. Please select a category manually.</p>
        </div>
      </div>
    );
  }

  const category = ISSUE_CATEGORIES[classification.category] || ISSUE_CATEGORIES.other;
  const severity = SEVERITY_LEVELS[classification.severity] || SEVERITY_LEVELS[2];

  const confidenceColor = classification.confidence > 70 ? 'text-green-300 bg-green-500/20' :
    classification.confidence > 50 ? 'text-amber-300 bg-amber-500/20' : 'text-white/50 bg-white/10';

  return (
    <div className="bg-white/10 border border-white/10 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-cyan-300">
        <Sparkles size={16} />
        <span className="text-xs font-semibold uppercase tracking-wide">AI Classification</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: category.color + '25' }}>
            <span className="text-lg" style={{ color: category.color }}>●</span>
          </span>
          <div>
            <p className="font-semibold text-white/90">{category.label}</p>
            <p className="text-xs text-white/50">{classification.department}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${confidenceColor}`}>
          {classification.confidence}% confident
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-white/50">Severity:</span>
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${classification.severity * 20}%`, backgroundColor: severity.color }} />
        </div>
        <span className="text-xs font-medium" style={{ color: severity.color }}>{severity.label}</span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-white/60">
          Suggested: <span className="font-medium text-white/90">{classification.suggestedTitle}</span>
          <Pencil size={12} className="inline ml-1 text-white/40" />
        </p>
      </div>

      <button onClick={onChangeCategory} className="text-xs text-cyan-300 font-medium hover:underline">
        Change category
      </button>
    </div>
  );
}
