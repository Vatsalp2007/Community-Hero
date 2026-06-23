import React from 'react';
import { ISSUE_STATUSES } from '@shared/constants.js';

export default function IssueStatusBadge({ status }) {
  const statusInfo = ISSUE_STATUSES[status] || ISSUE_STATUSES.open;
  
  return (
    <span 
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
    >
      {statusInfo.label}
    </span>
  );
}
