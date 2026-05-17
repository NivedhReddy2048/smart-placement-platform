'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  email: string;
  role: string;
  isOnboarded?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('access_token');
    
    if (token) {
      try {
        // Import apiClient dynamically to avoid circular dependencies if any
        const { default: apiClient } = await import('@/lib/axios');
        const res = await apiClient.get('/auth/me/');
        
        const userData = {
          name: res.data.username,
          email: res.data.email,
          role: res.data.role,
          isOnboarded: res.data.is_onboarded
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('auth_session', JSON.stringify(userData));
        localStorage.setItem('user_role', userData.role);
      } catch (e) {
        console.error("Session verification failed", e);
        // If token is invalid or expired, clear everything
        logout();
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('auth_session', JSON.stringify(userData));
    localStorage.setItem('user_role', userData.role);
  };

  const logout = useCallback(() => {
    if (typeof window === 'undefined') return;

    setUser(null);
    setIsAuthenticated(false);
    
    // Clear ALL auth and profile related keys
    const keysToRemove = [
      'access_token',
      'refresh_token',
      'user_role',
      'auth_session',
      'username',
      'is_onboarded',
      'user_data' // CRITICAL: This was missing and causing the leak
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    router.replace('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
