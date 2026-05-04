'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { useUser } from '@/context/UserContext';
import { 
  LayoutDashboard, 
  Target, 
  Briefcase, 
  FileText, 
  X, 
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Users
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileOpen, isCollapsed, closeMobile } = useSidebar();
  
  const studentLinks = [
    { href: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { href: '/dashboard/student/skills', label: 'Skill Intelligence', icon: BrainCircuit, badge: 'AI' },
    { href: '/dashboard/student/job-matches', label: 'Job Matches', icon: Briefcase, badge: '12' },
    { href: '/dashboard/student/resume-analyzer', label: 'Resume Analyzer', icon: FileText, badge: '92%' },
    { href: '/dashboard/student/applications', label: 'Applications', icon: TrendingUp, badge: null },
  ];

  const communityLinks = [
    { href: '/dashboard/student/community', label: 'Community', icon: Users },
    { href: '/dashboard/student/messages', label: 'Messages', icon: MessageSquare },
  ];

  const links = studentLinks; // Simplified for this task

  const { user } = useUser();

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={clsx(
          "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMobile}
      />

      {/* Sidebar Container */}
      <aside 
        className={clsx(
          "fixed md:sticky top-0 left-0 bottom-0 z-50 h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all duration-300 ease-in-out flex flex-col border-r border-slate-200 dark:border-slate-800 shadow-xl md:shadow-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={clsx(
          "h-16 flex items-center shrink-0 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50",
          isCollapsed ? "justify-center" : "justify-between px-5"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transition-transform active:scale-95 cursor-pointer">
              <span className="text-lg font-black tracking-tighter">{user.name ? user.name.charAt(0) : 'P'}</span>
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <p className="text-slate-900 dark:text-white font-black text-sm tracking-tight leading-none">
                  {user.name ? user.name.split(' ')[0] : 'Placement'}'s <span className="text-blue-600 dark:text-blue-400">Platform</span>
                </p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                  {user.role || 'Student Console'}
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button 
              onClick={closeMobile} 
              className="md:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-8 scrollbar-hide">
          {/* Main Navigation */}
          <div>
            {!isCollapsed && (
              <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                Main Console
              </p>
            )}
            <nav className="space-y-1.5">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobile}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-xl transition-all group relative",
                      isActive 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <Icon className={clsx(
                      "h-5 w-5 shrink-0 transition-transform group-hover:scale-110", 
                      isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    )} />
                    
                    {!isCollapsed && (
                      <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        {link.label}
                      </span>
                    )}

                    {!isCollapsed && link.badge && (
                      <span className={clsx(
                        "text-[10px] font-black px-1.5 py-0.5 rounded-md",
                        isActive ? "bg-white/20 text-white" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      )}>
                        {link.badge}
                      </span>
                    )}

                    {/* Collapsed Tooltip Placeholder (Optional Enhancement) */}
                    {isCollapsed && (
                       <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-slate-700 shadow-xl">
                         {link.label}
                       </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Social / Community */}
          <div>
             {!isCollapsed && (
              <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                Community
              </p>
            )}
            <nav className="space-y-1.5">
              {communityLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-xl transition-all group text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                >
                  <link.icon className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:scale-110" />
                  {!isCollapsed && <span className="flex-1">{link.label}</span>}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer / Help Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          {!isCollapsed ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4">
              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Support</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Need help with your career path?</p>
              <button 
                onClick={() => router.push("/dashboard/student/messages?mentor=true")}
                className="mt-3 w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Ask AI Mentor
              </button>
            </div>
          ) : (
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto text-slate-400 hover:bg-slate-900 dark:hover:text-white transition-colors cursor-pointer">
               <ChevronRight className="h-5 w-5" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
