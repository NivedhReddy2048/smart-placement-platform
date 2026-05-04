'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
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
  Briefcase
} from 'lucide-react';
import clsx from 'clsx';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  
  // Notification States
  const [emailNotify, setEmailNotify] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  
  // Password States
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Password update logic would go here. (UI Only Demo)");
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
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Current Password</label>
              <input 
                type="password"
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="••••••••"
                value={passwords.current}
                onChange={e => setPasswords({...passwords, current: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                <input 
                  type="password"
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="New password"
                  value={passwords.new}
                  onChange={e => setPasswords({...passwords, new: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Confirm New</label>
                <input 
                  type="password"
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Confirm new"
                  value={passwords.confirm}
                  onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-slate-200 dark:shadow-none"
          >
            Update Password
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <div>
             <p className="text-sm font-black text-slate-900 dark:text-white">Delete Account</p>
             <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">Permanently remove your account and all data.</p>
           </div>
           <button className="text-xs font-black text-rose-600 hover:text-rose-700 p-2">
             Delete Account
           </button>
        </div>
      </section>
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
