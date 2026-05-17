'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface User {
  isOnboarded: boolean;
  name: string;
  email: string;
  role: string;
  experience: string;
  skills: string[];
  resume: string | null;
}

const initialUser: User = {
  isOnboarded: false,
  name: "",
  email: "student@example.com",
  role: "",
  experience: "",
  skills: [],
  resume: null,
};

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isAuthenticated } = useAuth();
  const [user, setUserState] = useState<User>(initialUser);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with AuthContext and reset on logout
  useEffect(() => {
    if (!isAuthenticated || !authUser) {
      setUserState(initialUser);
      setIsLoading(false);
      return;
    }

    // Attempt to hydrate from localStorage ONLY if it belongs to the current auth user
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.email === authUser.email) {
          setUserState(parsed);
        } else {
          // Stale data detected from a different user!
          setUserState({ ...initialUser, ...authUser });
          localStorage.removeItem('user_data');
        }
      } catch (e) {
        setUserState({ ...initialUser, ...authUser });
      }
    } else {
      setUserState({ ...initialUser, ...authUser });
    }
    setIsLoading(false);
  }, [authUser, isAuthenticated]);

  // Sync to localStorage on update
  const setUser = (newUser: User) => {
    setUserState(newUser);
    if (isAuthenticated) {
      localStorage.setItem('user_data', JSON.stringify(newUser));
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setUserState((prev) => {
      const newUser = { ...prev, ...updates };
      if (isAuthenticated) {
        localStorage.setItem('user_data', JSON.stringify(newUser));
      }
      return newUser;
    });
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
