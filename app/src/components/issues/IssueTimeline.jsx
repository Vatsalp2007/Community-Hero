import React from 'react';
import { Flag, CheckCircle, User, Wrench, XCircle, MessageSquare, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const EVENT_ICONS = {
  created: Flag,
  verified: Check,
  assigned: User,
  in_progress: Wrench,
  status_changed: Wrench,
  resolved: CheckCircle,
  rejected: XCircle,
  commented: MessageSquare
};

const EVENT_COLORS = {
  created: '#6B7280',
  verified: '#16A34A',
  assigned: '#2563EB',
  in_progress: '#D97706',
  status_changed: '#D97706',
  resolved: '#16A34A',
  rejected: '#DC2626',
  commented: '#7C3AED'
};

export default function IssueTimeline({ events = [] }) {
  if (!events.length) return null;

  return (
    <div className="space-y-0">
      {events.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return aTime - bTime;
      }).map((event, idx) => {
        const Icon = EVENT_ICONS[event.type] || Flag;
        const color = EVENT_COLORS[event.type] || '#6B7280';
        const isLast = idx === events.length - 1;

        return (
          <div key={event.id || idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
                <Icon size={14} style={{ color }} />
              </div>
              {!isLast && <div className="w-0.5 h-6 bg-white/10" />}
            </div>
            <div className="pb-4">
              <p className="text-sm text-white/80">{event.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-medium text-white/50">{event.actorName}</span>
                <span className="text-xs text-white/40">
                  {event.createdAt ? formatDistanceToNow(new Date(event.createdAt.seconds ? event.createdAt.seconds * 1000 : event.createdAt), { addSuffix: true }) : ''}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
