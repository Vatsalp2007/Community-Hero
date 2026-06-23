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
      <h3 className="font-semibold text-gray-900">Comments ({comments.length})</h3>
      
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center text-xs font-semibold text-primary">
                {comment.authorName?.[0] || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
              <span className="text-xs text-gray-400">
                {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt.seconds ? comment.createdAt.seconds * 1000 : comment.createdAt), { addSuffix: true }) : ''}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-1.5">{comment.text}</p>
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500 text-center py-2">Sign in to comment</p>
      )}
    </div>
  );
}
