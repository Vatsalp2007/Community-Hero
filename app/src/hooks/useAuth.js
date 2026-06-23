import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signOut as authSignOut, resetPassword } from '@shared/auth.js';

export function useAuth() {
  const { user, userProfile, loading, setUserProfile, clearAuth } = useAuthStore();

  const loginWithGoogle = async () => {
    await signInWithGoogle();
  };

  const loginWithEmail = async (email, password) => {
    await signInWithEmail(email, password);
  };

  const signUp = async (email, password, name) => {
    const cred = await signUpWithEmail(email, password);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
    return cred;
  };

  const signOut = async () => {
    await authSignOut();
    clearAuth();
  };

  const forgotPassword = async (email) => {
    await resetPassword(email);
  };

  return { user, userProfile, loading, loginWithGoogle, loginWithEmail, signUp, signOut, forgotPassword, setUserProfile };
}

function updateProfile(user, profile) {
  return import('firebase/auth').then(({ updateProfile }) => updateProfile(user, profile));
}
