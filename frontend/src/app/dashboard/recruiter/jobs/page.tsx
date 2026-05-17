'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, 
  Search, 
  PlusCircle, 
  ArrowLeft, 
  Loader2, 
  Edit, 
  Trash2, 
  MapPin, 
  DollarSign, 
  Calendar,
  ChevronRight,
  Eye,
  Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import clsx from 'clsx';

export default function RecruiterJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await apiClient.get('/jobs/postings/');
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [jobs, searchQuery]);

  return (
    <ProtectedRoute allowedRoles={['RECRUITER']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/dashboard/recruiter')}
                className="p-3 bg-white dark:bg-slate-900 text-slate-400 hover:text-blue-600 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Inventory Management</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your active job opportunities and listings</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search postings..."
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <button 
                onClick={() => router.push('/dashboard/recruiter/jobs/new')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-black text-xs rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest"
              >
                <PlusCircle className="w-4 h-4" /> New Posting
              </button>
            </div>
          </div>

          {/* Jobs List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-40">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Inventory...</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div key={job.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all group flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner border border-slate-100 dark:border-slate-700">
                      <Briefcase className="w-7 h-7" />
                    </div>
                    <div className={clsx("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", job.is_active ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-slate-50 text-slate-400 dark:bg-slate-800")}>
                      {job.is_active ? 'Active' : 'Closed'}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic mb-2 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                  <p className="text-xs font-bold text-slate-400 mb-6 flex items-center gap-2">
                     <MapPin className="w-3 h-3" /> {job.location || 'Remote'}
                  </p>

                  <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-4">
                     <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Salary</p>
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">{job.salary_range || 'N/A'}</p>
                     </div>
                     <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Posted</p>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{new Date(job.created_at).toLocaleDateString()}</p>
                     </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                     <button 
                        onClick={() => router.push(`/dashboard/recruiter/jobs/${job.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                     >
                        <Settings className="w-4 h-4" /> Configure
                     </button>
                     <button 
                        onClick={() => router.push(`/dashboard/recruiter/applications?job=${job.id}`)}
                        className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
                     >
                        <Eye className="w-5 h-5" />
                     </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-24 text-center">
                 <Briefcase className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Listings Found</h3>
                 <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Start by posting your first opportunity to the platform.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
