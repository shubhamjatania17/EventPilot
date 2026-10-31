import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api, getAuthToken, setAuthToken } from '../services/api';
import { auth, signOut } from '../config/firebase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  googleAuth: (credential: string, intent: 'signin' | 'signup') => Promise<void>;
  signout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('eventpilot_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(() => {
    return !!getAuthToken();
  });

  const refreshProfile = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      localStorage.removeItem('eventpilot_user');
      setLoading(false);
      return;
    }

    try {
      const res = await api.getProfile();
      setUser(res.user);
      localStorage.setItem('eventpilot_user', JSON.stringify(res.user));
    } catch (err: any) {
      const errMsg = err?.message || '';
      // Only clear credentials if the server explicitly tells us the token is invalid/unauthorized
      if (errMsg.includes('401') || errMsg.includes('403') || errMsg.includes('jwt') || errMsg.includes('token') || errMsg.includes('Unauthorized')) {
        console.warn('Session expired or invalid token:', err);
        setAuthToken(null);
        localStorage.removeItem('eventpilot_user');
        setUser(null);
      } else {
        console.warn('Network issue during session refresh, retaining cached session:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();

    // Cross-tab synchronization: keep login state synchronized when user signs in from another tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'eventpilot_token' || e.key === 'eventpilot_user') {
        const token = getAuthToken();
        if (!token) {
          setUser(null);
        } else {
          try {
            const cached = localStorage.getItem('eventpilot_user');
            if (cached) setUser(JSON.parse(cached));
          } catch {}
          refreshProfile();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const signin = async (email: string, password: string) => {
    const res = await api.signin({ email, password });
    setAuthToken(res.token);
    localStorage.setItem('eventpilot_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const signup = async (email: string, password: string, displayName: string) => {
    const res = await api.signup({ email, password, displayName });
    setAuthToken(res.token);
    localStorage.setItem('eventpilot_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const googleAuth = async (credential: string, intent: 'signin' | 'signup') => {
    const res = await api.googleAuth({ credential, intent });
    setAuthToken(res.token);
    localStorage.setItem('eventpilot_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const signout = () => {
    setAuthToken(null);
    localStorage.removeItem('eventpilot_user');
    localStorage.removeItem('eventpilot_active_event_id');
    setUser(null);
    signOut(auth).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, signup, googleAuth, signout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
