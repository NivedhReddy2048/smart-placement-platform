'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useSidebar } from '@/context/SidebarContext';
import clsx from 'clsx';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <Sidebar role="STUDENT" />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300">
          <Navbar />

          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Step 3: Dark Mode Verification Block */}

              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
