import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useUpvote } from '../../hooks/useUpvote';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function UpvoteButton({ issueId, currentUpvotes = 0, upvotedBy = [], disabled }) {
  const { user } = useAuth();
  const { upvote, loading } = useUpvote();
  const hasUpvoted = user && upvotedBy.includes(user.uid);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to upvote');
      return;
    }
    if (hasUpvoted) {
      toast.error('You already upvoted this issue');
      return;
    }
    await upvote(issueId, user.uid, currentUpvotes, upvotedBy);
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={disabled || loading || hasUpvoted}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
        hasUpvoted
          ? 'bg-primary text-white'
          : 'bg-white/10 text-white/70 hover:bg-primary hover:text-white border border-white/10'
      } ${loading ? 'opacity-50' : ''}`}
    >
      <ArrowUp size={18} className={hasUpvoted ? 'fill-current' : ''} />
      <span>{currentUpvotes}</span>
    </button>
  );
}
