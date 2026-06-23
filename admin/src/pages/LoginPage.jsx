import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmail } from '@shared/auth.js';
import { getUserProfile } from '@shared/auth.js';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const cred = await signInWithEmail(data.email, data.password);
      const profile = await getUserProfile(cred.user.uid);
      if (!profile || !['officer', 'admin'].includes(profile.role)) {
        toast.error('Access denied. Officer/Admin role required.');
        await import('firebase/auth').then(m => m.getAuth().signOut());
        setLoading(false);
        return;
      }
      toast.success('Welcome, Officer!');
      navigate('/dashboard');
    } catch (e) {
      toast.error(e.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: '#f8f9ff',
        backgroundImage: 'radial-gradient(at 0% 0%, hsla(210,100%,98%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(220,100%,94%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(210,100%,98%,1) 0, transparent 50%)',
      }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-display-lg font-display-lg font-extrabold bg-gradient-to-r from-primary to-secondary-container bg-clip-text text-transparent">
            CivicAI Admin
          </h1>
          <p className="text-body-md text-on-surface-variant mt-2 font-body-md">
            Municipal Officer Dashboard
          </p>
        </div>
        <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register('email', { required: 'Email required' })}
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2.5 bg-white/80 border border-outline-variant/30 rounded-lg text-body-md text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
              {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
            </div>
            <div>
              <input
                {...register('password', { required: 'Password required' })}
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2.5 bg-white/80 border border-outline-variant/30 rounded-lg text-body-md text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
              {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary-container text-white font-label-md text-label-md rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
