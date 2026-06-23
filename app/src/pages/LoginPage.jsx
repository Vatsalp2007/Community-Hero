import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithEmail, signUp, forgotPassword } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(data.email, data.password, data.name);
        toast.success('Account created!');
      } else {
        await loginWithEmail(data.email, data.password);
        toast.success('Welcome back!');
      }
      navigate('/home');
    } catch (e) {
      toast.error(e.message || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Welcome!');
      navigate('/home');
    } catch (e) {
      toast.error(e.message || 'Google sign-in failed');
    }
  };

  const handleForgotPassword = async () => {
    const email = prompt('Enter your email:');
    if (email) {
      try {
        await forgotPassword(email);
        toast.success('Password reset email sent!');
      } catch (e) {
        toast.error(e.message || 'Failed to send reset email');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background">
      {/* Atmospheric background effects */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #003fb1, transparent)' }} />
        <div className="absolute bottom-[-10%] right-[-15%] w-[500px] h-[500px] rounded-full opacity-[0.10]" style={{ background: 'radial-gradient(circle, #57dffe, transparent)' }} />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #1A56DB, #06B6D4)' }}>
            CA
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Welcome to CivicAI</h1>
          <p className="text-sm text-on-surface-variant mt-1">Report issues. Build better communities.</p>
        </div>

        <div className="rounded-xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-md p-6">
          <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium text-on-surface bg-white/80 border border-outline-variant/30 hover:border-white/40 hover:shadow-lg transition-all duration-300">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="text-xs text-on-surface-variant">or</span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {isSignUp && (
              <input {...register('name', { required: 'Name is required' })} placeholder="Full Name" className="w-full px-4 py-2.5 bg-white/80 border border-outline-variant/30 rounded-lg text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all" />
            )}
            <input {...register('email', { required: 'Email is required' })} type="email" placeholder="Email" className="w-full px-4 py-2.5 bg-white/80 border border-outline-variant/30 rounded-lg text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all" />
            <input {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })} type="password" placeholder="Password" className="w-full px-4 py-2.5 bg-white/80 border border-outline-variant/30 rounded-lg text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all" />
            {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
            {errors.password && <p className="text-xs text-error">{errors.password.message}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-300" style={{ background: 'linear-gradient(135deg, #1A56DB, #06B6D4)' }}>
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center justify-between mt-4">
            <button onClick={() => { setIsSignUp(!isSignUp); reset(); }} className="text-sm text-primary font-medium hover:underline">
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
            {!isSignUp && (
              <button onClick={handleForgotPassword} className="text-sm text-on-surface-variant hover:underline">Forgot Password?</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
