"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    // Allow public routes
    const publicRoutes = ["/login", "/register", "/"];
    if (publicRoutes.includes(pathname)) {
      setIsVerifying(false);
      return;
    }

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    // Role check using verified user object from context
    if (allowedRoles && user.role) {
      const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());
      if (!normalizedAllowed.includes(user.role.toUpperCase())) {
        // Safe redirect to their own dashboard if on wrong route
        if (user.role === 'RECRUITER') router.replace("/dashboard/recruiter");
        else if (user.role === 'STUDENT') router.replace("/dashboard/student");
        else router.replace("/login");
        return;
      }
    }

    setIsVerifying(false);
  }, [pathname, allowedRoles, router, user, isAuthenticated, authLoading]);

  if ((isVerifying || authLoading) && !["/login", "/register", "/"].includes(pathname)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Verifying Identity</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
