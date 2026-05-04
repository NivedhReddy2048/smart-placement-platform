'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';

interface UserProtectedRouteProps {
  children: React.ReactNode;
}

export default function UserProtectedRoute({ children }: UserProtectedRouteProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user.isOnboarded && pathname !== '/onboarding') {
        router.replace('/onboarding');
      } else if (user.isOnboarded && pathname === '/onboarding') {
        router.replace('/dashboard/student');
      }
    }
  }, [user.isOnboarded, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl mb-4"></div>
          <p className="text-slate-500 font-bold">Initializing profile...</p>
        </div>
      </div>
    );
  }

  // If not onboarded and trying to access dashboard, don't render children
  if (!user.isOnboarded && pathname.startsWith('/dashboard')) {
    return null;
  }

  return <>{children}</>;
}
