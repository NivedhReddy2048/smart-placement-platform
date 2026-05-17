'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Users, PlusCircle, BarChart3, Settings, LogOut, Loader2, ArrowRight, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import apiClient from '@/lib/axios';
import clsx from 'clsx';

export default function RecruiterDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>({ active_jobs: 0, total_applications: 0, hiring_pipeline: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, appsRes, statsRes] = await Promise.all([
          apiClient.get('/jobs/postings/'),
          apiClient.get('/jobs/applications/'),
          apiClient.get('/jobs/stats/')
        ]);
        setJobs(jobsRes.data);
        setApplications(appsRes.data);
        setStatsData(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch recruiter data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Active Job Postings', value: statsData.active_jobs.toString(), icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Applications', value: statsData.total_applications.toString(), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Hiring Pipeline', value: statsData.hiring_pipeline.toString(), icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <ProtectedRoute allowedRoles={['RECRUITER']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Recruiter Command</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Operational intelligence for your talent acquisition</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/dashboard/recruiter/jobs/new')}
                className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black text-xs rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95 uppercase tracking-widest"
              >
                <PlusCircle className="w-5 h-5" />
                Post New Opportunity
              </button>
              <button 
                onClick={logout}
                className="p-4 bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-500 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all shadow-sm"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6 group hover:border-blue-500/30 transition-all">
                <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner", stat.bg, stat.color)}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Jobs List */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Postings</h3>
                <button onClick={() => router.push('/dashboard/recruiter/jobs')} className="text-xs font-black text-blue-600 hover:underline">Manage All</button>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  </div>
                ) : jobs.length > 0 ? (
                  jobs.map((job) => (
                    <div key={job.id} className="group flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight italic">{job.title}</p>
                          <div className="flex gap-4 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.location || 'Remote'}</span>
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">
                               {applications.filter(a => a.job === job.id).length} Applicants
                            </span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => router.push(`/dashboard/recruiter/jobs/${job.id}`)}
                        className="p-3 bg-white dark:bg-slate-900 text-blue-600 rounded-xl border border-blue-100 dark:border-blue-900/50 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Launch your first job posting to see results.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Applicants */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">Recent Applicants</h3>
              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : applications.length > 0 ? (
                  applications.slice(0, 6).map((app) => (
                    <div key={app.id} className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-sm">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase italic">{app.student_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">Applied for <span className="text-blue-500">{app.job_title}</span></p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-400 italic">Awaiting your first applicants...</p>
                  </div>
                )}
              </div>
              
              {applications.length > 0 && (
                <button 
                  onClick={() => router.push('/dashboard/recruiter/applications')}
                  className="w-full mt-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                >
                  Process Pipeline
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
