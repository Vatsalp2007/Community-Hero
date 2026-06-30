import React from 'react';

export default function LeaderboardRow({ rank, user, isCurrentUser }) {
  const rankStyles = {
    1: 'bg-yellow-50 border-yellow-200',
    2: 'bg-gray-50 border-gray-200',
    3: 'bg-orange-50 border-orange-200'
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
      isCurrentUser ? 'border-primary bg-primary-light' : rank <= 3 ? rankStyles[rank] || 'bg-white border-gray-100' : 'bg-white border-gray-100'
    }`}>
      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
        rank === 1 ? 'bg-yellow-400 text-white' : rank === 2 ? 'bg-gray-400 text-white' : rank === 3 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-600'
      }`}>
        {rank}
      </span>
      <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center overflow-hidden">
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-semibold text-primary">{user.displayName?.[0] || 'U'}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isCurrentUser ? 'text-primary' : 'text-gray-900'}`}>
          {user.displayName} {isCurrentUser && <span className="text-xs font-normal">(You)</span>}
        </p>
        <p className="text-xs text-gray-500 capitalize">{user.level || 'bronze'} level</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-gray-900">{user.civicScore || user.weeklyScore || 0}</p>
        <p className="text-xs text-gray-500">points</p>
      </div>
    </div>
  );
}
