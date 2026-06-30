import { useState } from 'react';
import { doc, updateDoc, arrayUnion, increment, runTransaction, collection } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { UPVOTE_THRESHOLD } from '@shared/constants.js';
import toast from 'react-hot-toast';

export function useUpvote() {
  const [loading, setLoading] = useState(false);

  const upvote = async (issueId, userId, currentUpvotes, upvotedBy) => {
    if (!userId) {
      toast.error('Please sign in to upvote');
      return false;
    }
    if (upvotedBy?.includes(userId)) {
      toast.error('You already upvoted this issue');
      return false;
    }

    setLoading(true);
    try {
      const issueRef = doc(db, 'issues', issueId);
      
      await runTransaction(db, async (transaction) => {
        const issueDoc = await transaction.get(issueRef);
        const newUpvotes = issueDoc.data().upvotes + 1;
        const shouldVerify = newUpvotes >= UPVOTE_THRESHOLD && !issueDoc.data().isVerified;
        
        transaction.update(issueRef, {
          upvotes: increment(1),
          upvotedBy: arrayUnion(userId),
          ...(shouldVerify && {
            isVerified: true,
            status: 'verified',
            updatedAt: new Date()
          })
        });
        
        if (shouldVerify) {
          const timelineRef = doc(collection(db, 'issues', issueId, 'timeline'));
          transaction.set(timelineRef, {
            type: 'verified',
            description: 'Community verified — reached 5 upvotes',
            actorId: 'system',
            actorName: 'Community',
            newStatus: 'verified',
            createdAt: new Date()
          });
          toast.success('Issue verified by community!');
        }
      });
      
      setLoading(false);
      return true;
    } catch (e) {
      console.error('Upvote failed:', e);
      toast.error('Failed to upvote');
      setLoading(false);
      return false;
    }
  };

  return { upvote, loading };
}
