'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { useUser } from '@/context/UserContext';
import { 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Bell,
  Search,
  UserCircle
} from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
  const { user: authUser, logout } = useAuth();
  const { user } = useUser();
  const { toggleMobile, toggleCollapse } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dropdownItems = [
    { label: 'View Profile', icon: User, href: '/dashboard/student/profile' },
    { label: 'Edit Profile', icon: UserCircle, href: '/dashboard/student/edit-profile' },
    { label: 'Settings', icon: Settings, href: '/dashboard/student/settings' },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Mobile Toggle */}
        <button 
          onClick={toggleMobile}
          className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle Mobile Menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button 
          onClick={toggleCollapse}
          className="hidden md:block p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Platform Logo */}
        <Link 
          href="/dashboard/student" 
          className="flex items-center gap-2 group transition-transform active:scale-95"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <span className="text-lg font-black tracking-tighter">P</span>
          </div>
          <span className="hidden sm:block text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Placement <span className="text-blue-600 dark:text-blue-400">Platform</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Navigation placeholder or empty space */}
        <div className="hidden lg:block w-64"></div>

        {/* Notifications */}
        <div className="relative" ref={notifyRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={clsx(
              "p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative group transition-colors",
              showNotifications && "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400"
            )}
          >
            <Bell className="h-5 w-5 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none py-4 px-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Notifications</h3>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">New</span>
              </div>
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                   <Bell className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No new notifications</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">We'll notify you about job matches and skill gaps.</p>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={clsx(
              "flex items-center gap-2 p-1 pl-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all active:scale-95",
              isDropdownOpen ? "border-blue-500 bg-white dark:bg-slate-900 ring-2 ring-blue-500/10" : ""
            )}
          >
            <div className="hidden sm:block text-right mr-1">
              <p className="text-xs font-black text-slate-900 dark:text-white leading-none">
                {authUser?.name || user.name || 'Student User'}
              </p>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                {authUser?.role || user.role || 'STUDENT'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
              {user.name ? user.name.charAt(0) : <UserCircle className="w-6 h-6" />}
            </div>
            <ChevronDown className={clsx("h-4 w-4 text-slate-400 transition-transform", isDropdownOpen && "rotate-180")} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-1 sm:hidden">
                <p className="text-sm font-black text-slate-900 dark:text-white">{user.name || 'Student User'}</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">student@platform.ai</p>
              </div>
              
              {dropdownItems.map((item) => (
                <Link 
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>
              
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
