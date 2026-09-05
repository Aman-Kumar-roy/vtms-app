import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { User } from '../types';
import { loginApi, getProfileApi } from '../api/auth';
import { setAuthToken, setOnUnauthorized } from '../api/client';
import { Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const STORAGE_KEY_TOKEN = '@vtms_auth_token';

const getStoredToken = async (): Promise<string | null> => {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
    if (val) return val;
  } catch (e) {}
  return null;
};

const saveStoredToken = async (token: string | null) => {
  try {
    if (token) {
      await AsyncStorage.setItem(STORAGE_KEY_TOKEN, token);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  } catch (e) {}
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    saveStoredToken(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getProfileApi();
      profile.id = profile._id || profile.id;
      setUser(profile);
    } catch (err) {
      console.warn('Failed to refresh profile:', err);
      logout();
    }
  }, [logout]);

  // Attempt auto-login on startup
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const savedToken = await getStoredToken();
        if (savedToken) {
          setAuthToken(savedToken);
          setToken(savedToken);
          const profile = await getProfileApi();
          profile.id = profile._id || profile.id;
          setUser(profile);
        }
      } catch (e) {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    setOnUnauthorized(() => {
      logout();
    });

    bootstrapAsync();
  }, [logout]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await loginApi(email, pass);
      const authenticatedUser = data.user;
      authenticatedUser.id = authenticatedUser._id || authenticatedUser.id;
      setUser(authenticatedUser);
      setToken(data.token);
      setAuthToken(data.token);
      await saveStoredToken(data.token);
    } catch (err: any) {
      const respData = err?.response?.data;
      const status = err?.response?.status;
      const rawMsg = (respData?.message || respData?.error || err.message || '').toLowerCase();
      if (status === 401 || rawMsg.includes('credential') || rawMsg.includes('invalid') || rawMsg.includes('password') || rawMsg.includes('email')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      throw new Error(respData?.message || respData?.error || err.message || 'Unable to sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAdmin, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
