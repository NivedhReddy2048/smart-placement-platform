'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Lock, LogIn, ShieldCheck, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import apiClient from '@/lib/axios';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    console.log("LOGIN CLICKED ✅");
    console.log("REQUEST PAYLOAD:", { username, password });
    try {
      const res = await apiClient.post("/auth/login/", {
        username: username.trim(),
        password: password.trim(),
      });

      console.log("LOGIN RESPONSE RECEIVED 📥");
      console.log("RESPONSE DATA:", res.data);

      // ✅ EXTRACT DATA
      const { access, refresh, role, username: responseUsername } = res.data;

      const userData = {
        name: responseUsername || username,
        email: res.data.email || "",
        role: role || "student"
      };

      // ✅ STORE AUTH DATA
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("auth_session", JSON.stringify(userData));
      localStorage.setItem("user_role", role || userData.role);
      localStorage.setItem("username", responseUsername || username);

      console.log("SUCCESS: AUTH DATA STORED 💾");
      console.log("ACCESS TOKEN:", localStorage.getItem("access_token")?.substring(0, 10) + "...");
      console.log("USER ROLE:", localStorage.getItem("user_role"));

      // Update Auth State
      login(userData);

      // ✅ REDIRECT
      console.log("REDIRECTING TO DASHBOARD... 🚀");
      router.replace("/dashboard/student");
    } catch (error: any) {
      console.error("LOGIN ERROR STATUS:", error.response?.status);
      console.error("LOGIN ERROR DATA:", error.response?.data);
      alert(error.response?.data?.detail || "Invalid credentials");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 🔥 CRITICAL
    console.log("FORM SUBMITTED 📝");
    setIsSubmitting(true);
    handleLogin();
  };

  useEffect(() => {
    console.log("LOGIN PAGE MOUNTED");
  }, []);

  return (
    <div style={{ pointerEvents: "auto", position: "relative", zIndex: 9999 }}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Sign in to your placement dashboard</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-blue-500/5">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Enter username (not email)"
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
                type="button"
                style={{ zIndex: 99999, position: "relative" }}
                onClick={() => {
                  console.log("BUTTON CLICK FIRED 🚀");
                  handleLogin();
                }}
                className={clsx(
                  "w-full flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl transition-all shadow-xl shadow-slate-200 dark:shadow-none",
                  isSubmitting ? "opacity-70 cursor-wait" : "hover:scale-[1.02] active:scale-95"
                )}
              >
                {isSubmitting ? "Authenticating..." : "Sign In"}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Use valid registered credentials
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
