import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api, getAuthToken, setAuthToken } from '../services/api';

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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getProfile();
      setUser(res.user);
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const signin = async (email: string, password: string) => {
    const res = await api.signin({ email, password });
    setAuthToken(res.token);
    setUser(res.user);
  };

  const signup = async (email: string, password: string, displayName: string) => {
    const res = await api.signup({ email, password, displayName });
    setAuthToken(res.token);
    setUser(res.user);
  };

  const googleAuth = async (credential: string, intent: 'signin' | 'signup') => {
    const res = await api.googleAuth({ credential, intent });
    setAuthToken(res.token);
    setUser(res.user);
  };

  const signout = () => {
    setAuthToken(null);
    setUser(null);
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
