import { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, startAfter, doc } from 'firebase/firestore';
import { db } from '@shared/firebase.js';

export function useIssues(filters = {}) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    let q = collection(db, 'issues');
    const constraints = [orderBy('createdAt', 'desc'), limit(20)];

    if (filters.category) {
      constraints.unshift(where('category', '==', filters.category));
    }
    if (filters.status) {
      constraints.unshift(where('status', '==', filters.status));
    }
    if (filters.ward) {
      constraints.unshift(where('ward', '==', filters.ward));
    }

    q = query(q, ...constraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issueList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIssues(issueList);
      setHasMore(issueList.length >= 20);
      setLoading(false);
      lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filters.category, filters.status, filters.ward]);

  const loadMore = () => {
    if (!lastDocRef.current || !hasMore) return;
  };

  return { issues, loading, error, hasMore, loadMore };
}

export function useIssueById(issueId) {
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!issueId) return;
    const unsubscribe = onSnapshot(doc(db, 'issues', issueId), (docSnap) => {
      if (docSnap.exists()) {
        setIssue({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [issueId]);

  return { issue, loading };
}
