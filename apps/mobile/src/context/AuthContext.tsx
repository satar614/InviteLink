import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, setAuthToken, clearAuthToken as clearApiToken } from '../api/apiClient';
import type { LoginRequest } from '../types/api';

const AUTH_TOKEN_KEY = '@invitelink_auth_token';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  signIn: (credentials: LoginRequest) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load token from AsyncStorage on mount
  useEffect(() => {
    loadToken();
  }, []);

  // Update API client when token changes
  useEffect(() => {
    if (token) {
      setAuthToken(token);
    } else {
      clearApiToken();
    }
  }, [token]);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (err) {
      console.error('Failed to load auth token:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (credentials: LoginRequest) => {
    try {
      setError(null);
      setIsLoading(true);

      // Call backend login endpoint
      const response = await apiClient.login(credentials);

      // Store token
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
      setToken(response.token);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      setToken(null);
      clearApiToken();
    } catch (err) {
      console.error('Failed to sign out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated: !!token,
    isLoading,
    token,
    signIn,
    signOut,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
