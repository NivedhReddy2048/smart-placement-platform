'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import apiClient from '@/lib/axios';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await apiClient.post("/auth/login/", {
        username: username.trim(),
        password: password.trim(),
      });

      const { access, refresh, role, username: responseUsername, is_onboarded: isOnboarded } = res.data;

      const userData = {
        name: responseUsername || username,
        email: res.data.email || "",
        role: role || "student",
        isOnboarded: !!isOnboarded
      };

      // Store in localStorage
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("auth_session", JSON.stringify(userData));
      localStorage.setItem("user_role", role || userData.role);
      localStorage.setItem("username", responseUsername || username);
      localStorage.setItem("is_onboarded", String(!!isOnboarded));

      // Update Context
      login(userData);

      // Redirect based on role
      if (role?.toUpperCase() === 'RECRUITER') {
        router.replace("/dashboard/recruiter");
      } else {
        router.replace("/dashboard/student");
      }
    } catch (error: any) {
      alert(error.response?.data?.detail || "Invalid credentials. Please check your username and password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Access Point</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Authenticated login for platform users</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-blue-500/5">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Enter username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx(
                "w-full flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl transition-all shadow-xl shadow-slate-200 dark:shadow-none",
                isSubmitting ? "opacity-70 cursor-wait" : "hover:scale-[1.02] active:scale-95"
              )}
            >
              {isSubmitting ? "Authenticating..." : "Sign In"}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Don't have an account?{" "}
              <button 
                type="button"
                onClick={() => router.push('/register')}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Join Now
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
