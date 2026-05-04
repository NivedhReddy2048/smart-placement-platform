'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { 
  User as UserIcon, 
  Mail, 
  Briefcase, 
  Code, 
  FileText, 
  Edit3,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-6 relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-500/20">
            {user.name ? user.name.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{user.name || 'Student User'}</h1>
              <ShieldCheck className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">{user.role || 'Career Explorer'}</p>
          </div>
        </div>

        <button 
          onClick={() => router.push('/dashboard/student/edit-profile')}
          className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200 dark:shadow-none whitespace-nowrap"
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="md:col-span-1 space-y-8">
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-8 shadow-sm">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Contact & Status</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{user.experience || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-8 shadow-sm">
             <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Resume</h2>
             {user.resume ? (
               <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl">
                 <div className="flex items-center gap-3 overflow-hidden">
                   <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                   <span className="text-xs font-black text-blue-700 dark:text-blue-300 truncate">{user.resume}</span>
                 </div>
                 <ExternalLink className="w-4 h-4 text-blue-400 cursor-pointer" />
               </div>
             ) : (
               <div className="text-center py-4">
                 <p className="text-xs font-bold text-slate-400 italic">No resume uploaded</p>
                 <button 
                  onClick={() => router.push('/dashboard/student/edit-profile')}
                  className="mt-4 text-xs font-black text-blue-600 hover:underline"
                 >
                   Upload Now
                 </button>
               </div>
             )}
          </section>
        </div>

        {/* Skills & Bio */}
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-8 sm:p-10 shadow-sm">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Technical Expertise</h2>
            
            <div className="flex flex-wrap gap-3">
              {user.skills && user.skills.length > 0 ? (
                user.skills.map(skill => (
                  <span 
                    key={skill}
                    className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-black rounded-2xl border border-slate-100 dark:border-slate-800"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <div className="w-full text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Code className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No skills highlighted yet</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 sm:p-10 text-white shadow-xl shadow-blue-500/20">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black tracking-tight">Placement Readiness</h3>
             </div>
             <p className="text-blue-100 font-bold text-sm leading-relaxed mb-6">
               Your profile is currently being analyzed by our AI models. Complete your resume details to unlock precise hiring probability and job recommendations.
             </p>
             <button className="bg-white text-blue-700 font-black text-xs px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
               View Insights
             </button>
          </section>
        </div>
      </div>
    </div>
  );
}
