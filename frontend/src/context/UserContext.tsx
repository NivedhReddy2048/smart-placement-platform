'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  const [user, setUserState] = useState<User>(initialUser);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      try {
        setUserState(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Sync to localStorage on update
  const setUser = (newUser: User) => {
    setUserState(newUser);
    localStorage.setItem('user_data', JSON.stringify(newUser));
  };

  const updateUser = (updates: Partial<User>) => {
    setUserState((prev) => {
      const newUser = { ...prev, ...updates };
      localStorage.setItem('user_data', JSON.stringify(newUser));
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
