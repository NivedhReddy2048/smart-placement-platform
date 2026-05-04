"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("access_token") : null;
    
    // ✅ Allow public routes to render normally without auth check
    const publicRoutes = ["/login", "/register", "/"];
    if (publicRoutes.includes(pathname)) {
      setLoading(false);
      return;
    }

    if (!token) {
      router.replace("/login");
    } else {
      // Token exists, check roles if required
      const userRole = typeof window !== "undefined" ? window.localStorage.getItem("user_role") : null;
      
      console.log("ROLE CHECK:", {
        allowedRoles,
        userRole
      });

      if (
        allowedRoles &&
        userRole &&
        !allowedRoles.map(r => r.toLowerCase()).includes(userRole.toLowerCase())
      ) {
        console.log("ROLE MISMATCH - Redirecting to default dashboard");
        router.replace("/dashboard");
      } else {
        setLoading(false);
      }
    }
  }, [pathname]);

  if (loading && !["/login", "/register", "/"].includes(pathname)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600/10 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Verifying Session</p>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
