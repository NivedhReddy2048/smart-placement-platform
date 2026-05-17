'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  ExternalLink,
  Target,
  ChevronDown,
  Mail,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import clsx from 'clsx';

export default function RecruiterApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await apiClient.get('/jobs/applications/');
      setApplications(res.data);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId: number, newStatus: string) => {
    setUpdatingId(appId);
    try {
      await apiClient.patch(`/jobs/applications/${appId}/`, { status: newStatus });
      setApplications(prev => prev.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.job_title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'All' || app.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [applications, searchQuery, filterStatus]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HIRED': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'INTERVIEW': return <Users className="w-4 h-4 text-purple-500" />;
      case 'SHORTLISTED': return <Target className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusCls = (status: string) => {
    switch (status) {
      case 'HIRED': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-800';
      case 'REJECTED': return 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-100 dark:border-rose-800';
      case 'INTERVIEW': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 border-purple-100 dark:border-purple-800';
      case 'SHORTLISTED': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-800';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700';
    }
  };

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
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Application Pipeline</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage candidates and track recruitment status</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search candidates..."
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <Filter className="w-4 h-4 text-slate-400" />
                <select 
                  className="bg-transparent text-xs font-black text-blue-600 outline-none py-2 cursor-pointer uppercase tracking-widest"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="APPLIED">Applied</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="HIRED">Hired</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Pipeline...</p>
              </div>
            ) : filteredApplications.length > 0 ? (
              filteredApplications.map((app) => (
                <div key={app.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all group">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                    {/* Candidate Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-800/50 group-hover:scale-105 transition-transform">
                          <User className="w-7 h-7" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic truncate">{app.student_name}</h3>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-0.5">{app.job_title}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <Clock className="w-3.5 h-3.5" /> Applied {new Date(app.applied_at).toLocaleDateString()}
                        </div>
                        <div className={clsx("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border", getStatusCls(app.status))}>
                           {getStatusIcon(app.status)} {app.status}
                        </div>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="w-full lg:w-48 shrink-0">
                       <div className="flex justify-between items-end mb-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alignment Index</span>
                          <span className="text-sm font-black text-slate-900 dark:text-white italic">{Math.round(app.match_score)}%</span>
                       </div>
                       <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all duration-1000" 
                            style={{ width: `${app.match_score}%` }}
                          />
                       </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                       {app.resume_url && (
                         <a 
                           href={app.resume_url} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-black rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                         >
                           <FileText className="w-4 h-4" /> CV
                         </a>
                       )}
                       
                       <div className="relative flex-1 lg:flex-none">
                          <select 
                            disabled={updatingId === app.id}
                            className="w-full lg:w-auto appearance-none pl-6 pr-12 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer uppercase tracking-widest disabled:opacity-50"
                            value={app.status}
                            onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                          >
                            <option value="APPLIED">Pending</option>
                            <option value="SHORTLISTED">Shortlist</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="HIRED">Hire</option>
                            <option value="REJECTED">Reject</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white dark:text-slate-900 pointer-events-none" />
                       </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-24 text-center">
                 <Users className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Candidates Match</h3>
                 <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Adjust your filters or try searching for a different name.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
