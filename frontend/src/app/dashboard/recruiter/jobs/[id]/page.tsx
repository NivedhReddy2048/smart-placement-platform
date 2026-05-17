'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Briefcase, MapPin, DollarSign, FileText, Save, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import apiClient from '@/lib/axios';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;
  
  const [roles, setRoles] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    role_id: '',
    description: '',
    location: '',
    salary_range: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, jobRes] = await Promise.all([
          apiClient.get('/core/job-roles/'),
          apiClient.get(`/jobs/postings/${jobId}/`)
        ]);
        
        setRoles(rolesRes.data);
        
        const job = jobRes.data;
        setFormData({
          title: job.title,
          role_id: job.role,
          description: job.description,
          location: job.location || '',
          salary_range: job.salary_range || '',
        });
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    
    if (jobId) {
      fetchData();
    }
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await apiClient.put(`/jobs/postings/${jobId}/`, {
        title: formData.title,
        role: formData.role_id,
        description: formData.description,
        location: formData.location,
        salary_range: formData.salary_range,
      });
      alert("Job updated successfully!");
      router.push('/dashboard/recruiter');
    } catch (err: any) {
      console.error("Failed to update job", err.response?.data);
      setError(err.response?.data?.detail || "Failed to update job.");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/jobs/postings/${jobId}/`);
      alert("Job deleted successfully!");
      router.push('/dashboard/recruiter');
    } catch (err) {
      console.error("Failed to delete job", err);
      alert("Failed to delete job.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['RECRUITER']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Dashboard</span>
          </button>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-xl shadow-blue-500/5">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Edit Job Posting</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Update the details of your opportunity.</p>
              </div>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 transition-all rounded-2xl"
                title="Delete Posting"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-2xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title & Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="e.g. Senior Frontend Developer"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Job Role Category</label>
                  <select
                    required
                    className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={formData.role_id}
                    onChange={e => setFormData({...formData, role_id: e.target.value})}
                  >
                    <option value="">Select a role</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location & Salary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="e.g. Remote, New York, etc."
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Salary Range</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="e.g. $80k - $120k"
                      value={formData.salary_range}
                      onChange={e => setFormData({...formData, salary_range: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Job Description</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-5 w-4 h-4 text-slate-400" />
                  <textarea
                    required
                    rows={6}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    placeholder="Describe the responsibilities, requirements, and benefits..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Updating..." : "Save Changes"}
                {!isSubmitting && <Save className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
