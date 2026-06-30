import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, Clock, MapPin } from 'lucide-react';
import IssueStatusBadge from './IssueStatusBadge';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS } from '@shared/constants.js';
import { formatDistanceToNow } from 'date-fns';

export default function IssueCard({ issue, showDistance, onClick }) {
  const navigate = useNavigate();
  const category = ISSUE_CATEGORIES[issue.category] || ISSUE_CATEGORIES.other;
  const severity = SEVERITY_LEVELS[issue.severity] || SEVERITY_LEVELS[2];

  const handleClick = () => {
    if (onClick) return onClick();
    navigate(`/issues/${issue.id}`);
  };

  return (
    <div onClick={handleClick} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
          {issue.thumbnailUrl ? (
            <img src={issue.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-2xl">📷</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{issue.title}</h3>
            <IssueStatusBadge status={issue.status} />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: category.color + '15', color: category.color }}>
              {category.label}
            </span>
            <span className="text-xs font-medium" style={{ color: severity.color }}>
              {severity.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><ArrowUp size={12} /> {issue.upvotes || 0}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {issue.createdAt ? formatDistanceToNow(new Date(issue.createdAt.seconds ? issue.createdAt.seconds * 1000 : issue.createdAt), { addSuffix: true }) : 'just now'}</span>
          </div>
          {issue.address && (
            <p className="text-xs text-gray-400 mt-1 truncate flex items-center gap-1">
              <MapPin size={10} /> {issue.address}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
