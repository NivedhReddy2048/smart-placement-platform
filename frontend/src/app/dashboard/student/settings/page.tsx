'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import { 
  Moon, 
  Sun, 
  Bell, 
  Lock, 
  User, 
  ShieldCheck,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Briefcase,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  
  // Notification States
  const [emailNotify, setEmailNotify] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  
  // Password States
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [passError, setPassError] = useState<any>(null);
  const [passSuccess, setPassSuccess] = useState(false);

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (passwords.new !== passwords.confirm) {
      setPassError({ confirm_password: ["Passwords do not match"] });
      return;
    }

    setIsUpdating(true);
    try {
      await apiClient.post('/accounts/change-password/', {
        old_password: passwords.current,
        new_password: passwords.new,
        confirm_password: passwords.confirm
      });
      setPassSuccess(true);
      setPasswords({ current: '', new: '', confirm: '' });
      
      setTimeout(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }, 2000);

    } catch (err: any) {
      if (err.response?.data) {
        setPassError(err.response.data);
      } else {
        setPassError({ general: "Failed to update password. Try again." });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await apiClient.post('/accounts/delete-account/');
      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      console.error("Deletion failed", err);
      alert("Failed to delete account. Please contact support.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your account preferences, appearance, and security.</p>
      </div>

      {/* 🌓 APPEARANCE SECTION */}
      <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-all">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <Sun className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Appearance</h2>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white">Theme Mode</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
              Currently using <span className="text-blue-600 dark:text-blue-400 capitalize">{theme}</span> mode
            </p>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-200 dark:bg-blue-600 transition-colors focus:outline-none ring-2 ring-transparent focus:ring-blue-500/20"
          >
            <span className="sr-only">Toggle theme</span>
            <span
              className={clsx(
                "inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 flex items-center justify-center",
                theme === 'dark' ? "translate-x-7" : "translate-x-1"
              )}
            >
              {theme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div 
            onClick={() => theme !== 'light' && toggleTheme()}
            className={clsx(
              "cursor-pointer rounded-2xl p-4 border-2 transition-all",
              theme === 'light' ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10" : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
            )}
          >
             <div className="aspect-video bg-white rounded-lg shadow-sm mb-3 border border-slate-200 flex flex-col gap-2 p-2">
                <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                <div className="h-2 w-3/4 bg-slate-100 rounded-full"></div>
             </div>
             <p className="text-xs font-bold text-center text-slate-900 dark:text-white">Light Mode</p>
          </div>
          <div 
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={clsx(
              "cursor-pointer rounded-2xl p-4 border-2 transition-all",
              theme === 'dark' ? "border-blue-500 bg-blue-900/20" : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
            )}
          >
             <div className="aspect-video bg-slate-950 rounded-lg shadow-sm mb-3 border border-slate-800 flex flex-col gap-2 p-2">
                <div className="h-2 w-full bg-slate-800 rounded-full"></div>
                <div className="h-2 w-3/4 bg-slate-800 rounded-full"></div>
             </div>
             <p className="text-xs font-bold text-center text-slate-900 dark:text-white">Dark Mode</p>
          </div>
        </div>
      </section>

      {/* 🔔 NOTIFICATIONS SECTION */}
      <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-all">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
        </div>

        <div className="space-y-4">
          {[
            { id: 'email', label: 'Email Notifications', desc: 'Receive placement updates and skill gap alerts via email.', state: emailNotify, set: setEmailNotify, icon: Mail },
            { id: 'jobs', label: 'Job Match Alerts', desc: 'Get notified as soon as a job matches your profile.', state: jobAlerts, set: setJobAlerts, icon: Briefcase },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-colors">
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex w-10 h-10 rounded-xl bg-white dark:bg-slate-800 items-center justify-center border border-slate-100 dark:border-slate-700">
                  <item.icon className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{item.label}</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
              <button 
                onClick={() => item.set(!item.state)}
                className={clsx(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                  item.state ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                )}
              >
                <span className={clsx(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                  item.state ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 🔐 ACCOUNT & SECURITY SECTION */}
      <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-all">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-xl">
            <Lock className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account & Security</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          {passSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5" />
              Password updated! Redirecting to login...
            </div>
          )}
          {passError?.general && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-400 text-sm font-bold">
              <AlertTriangle className="w-5 h-5" />
              {passError.general}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Current Password</label>
              <input 
                type="password"
                required
                className={clsx(
                  "w-full p-3.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all",
                  passError?.old_password ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                )}
                placeholder="••••••••"
                value={passwords.current}
                onChange={e => setPasswords({...passwords, current: e.target.value})}
              />
              {passError?.old_password && <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase tracking-widest">{passError.old_password[0]}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                <input 
                  type="password"
                  required
                  className={clsx(
                    "w-full p-3.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all",
                    passError?.new_password ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                  )}
                  placeholder="New password"
                  value={passwords.new}
                  onChange={e => setPasswords({...passwords, new: e.target.value})}
                />
                {passError?.new_password && <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase tracking-widest">{passError.new_password[0]}</p>}
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Confirm New</label>
                <input 
                  type="password"
                  required
                  className={clsx(
                    "w-full p-3.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all",
                    passError?.confirm_password ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                  )}
                  placeholder="Confirm new"
                  value={passwords.confirm}
                  onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                />
                {passError?.confirm_password && <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase tracking-widest">{passError.confirm_password[0]}</p>}
              </div>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={isUpdating}
            className="w-full sm:w-auto px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-slate-200 dark:shadow-none flex items-center justify-center gap-2"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <div>
             <p className="text-sm font-black text-slate-900 dark:text-white">Delete Account</p>
             <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">Permanently remove your account and all data.</p>
           </div>
           <button 
             onClick={() => setShowDeleteModal(true)}
             className="text-xs font-black text-rose-600 hover:text-rose-700 p-2"
           >
             Delete Account
           </button>
        </div>
      </section>

      {/* 🗑 DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">Critical Action</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mt-2 leading-relaxed">
                  This will permanently delete your professional profile, all job applications, and career history. <span className="text-rose-600">This cannot be undone.</span>
                </p>
              </div>
              
              <div className="flex flex-col w-full gap-3 mt-4">
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="w-full py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-500 active:scale-95 transition-all shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'YES, DELETE MY DATA'}
                </button>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  CANCEL
                </button>
              </div>
            </div>
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Switch Component if needed (inline version used above for clarity)
function Switch({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <button 
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
        checked ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
      )}
    >
      <span className={clsx(
        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
        checked ? "translate-x-6" : "translate-x-1"
      )} />
    </button>
  );
}
