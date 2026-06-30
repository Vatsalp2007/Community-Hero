import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@shared/firebase.js';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommentSection({ issueId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    import('firebase/auth').then(({ getAuth, onAuthStateChanged }) => {
      onAuthStateChanged(getAuth(), (u) => setUser(u));
    });
  }, []);

  useEffect(() => {
    if (!issueId) return;
    const q = query(collection(db, 'issues', issueId, 'comments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [issueId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'issues', issueId, 'comments'), {
        authorId: user.uid,
        authorName: user.displayName || 'Officer',
        authorPhoto: user.photoURL || '',
        authorRole: 'officer',
        text: newComment.trim(),
        createdAt: new Date()
      });
      setNewComment('');
    } catch (e) {
      toast.error('Failed to post comment');
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white/90">Comments ({comments.length})</h3>
      
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-cyan-400/20 flex items-center justify-center text-xs font-semibold text-cyan-300">
                {comment.authorName?.[0] || 'U'}
              </div>
              <span className="text-sm font-medium text-white/90">{comment.authorName}</span>
              <span className="text-xs text-white/40">
                {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt.seconds ? comment.createdAt.seconds * 1000 : comment.createdAt), { addSuffix: true }) : ''}
              </span>
            </div>
            <p className="text-sm text-white/70 mt-1.5">{comment.text}</p>
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="px-4 py-2 bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      ) : (
        <p className="text-sm text-white/40 text-center py-2">Sign in to comment</p>
      )}
    </div>
  );
}
