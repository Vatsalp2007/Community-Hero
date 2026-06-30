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
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] bg-clip-text text-transparent">
            CivicAI Admin
          </h1>
          <p className="text-white/60 mt-2">
            Municipal Officer Dashboard
          </p>
        </div>
        <div className="rounded-2xl bg-white/20 backdrop-blur-xl border border-white/10 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register('email', { required: 'Email required' })}
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div>
              <input
                {...register('password', { required: 'Password required' })}
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#1A56DB] to-[#06B6D4] text-white font-semibold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
