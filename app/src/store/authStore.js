import { create } from 'zustand';
import { onAuthChange, getUserProfile, createUserProfile } from '@shared/auth.js';

let initialized = false;
let unsubscribeFn = null;

const useAuthStore = create((set) => ({
  user: null,
  userProfile: null,
  loading: true,

  init: () => {
    if (initialized) return;
    initialized = true;

    try {
      unsubscribeFn = onAuthChange(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            let profile = await getUserProfile(firebaseUser.uid);
            if (!profile) {
              profile = await createUserProfile(firebaseUser);
            }
            set({ user: firebaseUser, userProfile: profile, loading: false });
          } catch (e) {
            console.warn('Profile fetch failed:', e);
            set({ user: firebaseUser, userProfile: null, loading: false });
          }
        } else {
          set({ user: null, userProfile: null, loading: false });
        }
      });
    } catch (e) {
      console.warn('Auth init failed:', e);
      set({ user: null, userProfile: null, loading: false });
    }

    // Safety timeout: if loading is still true after 5s, set it to false
    setTimeout(() => {
      const state = useAuthStore.getState();
      if (state.loading) {
        console.warn('Auth loading timeout — setting loading to false');
        set({ loading: false });
      }
    }, 5000);
  },

  setUserProfile: (profile) => set({ userProfile: profile }),

  clearAuth: () => {
    set({ user: null, userProfile: null, loading: false });
  }
}));

export default useAuthStore;
