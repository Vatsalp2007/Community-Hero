import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { LEVEL_THRESHOLDS } from '@shared/constants.js';
import { calculateLevel } from '@shared/firestore.js';

export default function CivicScoreCard({ score = 0 }) {
  const level = calculateLevel(score);
  const levels = Object.entries(LEVEL_THRESHOLDS);
  const currentIdx = levels.findIndex(([l]) => l === level);
  const nextLevel = currentIdx < levels.length - 1 ? levels[currentIdx + 1] : null;
  const progress = nextLevel ? ((score - levels[currentIdx][1]) / (nextLevel[1] - levels[currentIdx][1])) * 100 : 100;

  const levelColors = {
    bronze: 'from-amber-600 to-amber-800',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-400 to-purple-600',
    hero: 'from-red-400 to-pink-600'
  };

  return (
    <div className={`bg-gradient-to-br ${levelColors[level]} rounded-2xl p-5 text-white`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={20} />
          <span className="text-sm font-medium opacity-90">Civic Score</span>
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-white/20 rounded-full capitalize">{level}</span>
      </div>
      <div className="text-4xl font-bold mb-3">{score}</div>
      {nextLevel && (
        <div>
          <div className="flex justify-between text-xs mb-1 opacity-80">
            <span>{level}</span>
            <span>{nextLevel[0]}</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs opacity-70 mt-1">{nextLevel[1] - score} points to next level</p>
        </div>
      )}
    </div>
  );
}
