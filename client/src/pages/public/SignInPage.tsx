import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { signInWithGooglePopup } from '../../config/firebase';
import { ArrowLeft, AlertCircle, Lock, Mail } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { signin, googleAuth } = useAuth();
  const { loadUserWorkspace } = useEvent();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signin(email, password);
      await loadUserWorkspace();
      navigate('/app/overview');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { idToken } = await signInWithGooglePopup();
      await googleAuth(idToken, 'signin');
      await loadUserWorkspace();
      navigate('/app/overview');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before completion.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Google sign-in popup request was cancelled.');
      } else {
        setError(err.message || 'No existing EventPilot account associated with this Google identity. Please sign up first.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to EventPilot
        </Link>
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="EventPilot"
            className="w-9 h-9 rounded-lg object-contain shadow-xs border border-white/15"
          />
          <span className="font-heading text-2xl font-bold tracking-tight metallic-chrome-text">
            EventPilot
          </span>
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
          Sign In
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Access your private event workspace and active plans.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="metallic-card py-8 px-4 border border-white/15 shadow-2xl sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-zinc-900 border border-zinc-700 flex items-start gap-3 text-sm text-zinc-200">
              <AlertCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{error}</p>
                {error.includes('Create an account first') || error.includes('sign up first') ? (
                  <Link to="/signup" className="text-white underline font-bold mt-1 inline-block">
                    Go to Sign Up →
                  </Link>
                ) : null}
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Email address
              </label>
              <div className="mt-1.5 relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="organizer@event.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 metallic-input rounded-xl text-white text-sm placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1.5 relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 metallic-input rounded-xl text-white text-sm placeholder:text-zinc-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 metallic-btn-primary rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0e1015] px-2 text-zinc-400 font-semibold tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 metallic-btn-secondary rounded-xl text-sm font-semibold text-slate-200 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-zinc-400">
            Don't have an EventPilot account?{' '}
            <Link to="/signup" className="font-bold text-white hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};