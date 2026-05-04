'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      const savedAuth = localStorage.getItem('auth_session');
      if (savedAuth) {
        try {
          setUser(JSON.parse(savedAuth));
        } catch (e) {
          console.error("Failed to restore session", e);
          localStorage.removeItem('auth_session');
        }
      } else {
        // Fallback user if token exists but session data is missing
        setUser({
          name: "User",
          email: "",
          role: "student"
        });
      }
    }
    
    setIsLoading(false);
  }, []);

  // Debugging logs for session status
  useEffect(() => {
    console.log("TOKEN:", localStorage.getItem("access_token"));
    console.log("USER:", localStorage.getItem("auth_session"));
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('auth_session', JSON.stringify(userData));
    // Token is typically set in the login page handler, but we ensure state is updated here
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('auth_session');
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      // isAuthenticated strictly depends on the token presence
      isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('access_token') : false, 
      isLoading, 
      login, 
      logout 
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
