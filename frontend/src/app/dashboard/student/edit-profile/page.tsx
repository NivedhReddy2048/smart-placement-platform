'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Briefcase, 
  Code, 
  FileUp, 
  CheckCircle2, 
  X,
  ArrowLeft,
  Save,
  Loader2
} from 'lucide-react';
import clsx from 'clsx';
import apiClient from '@/lib/axios';

export default function EditProfilePage() {
  const router = useRouter();
  const { updateUser } = useUser();
  const { user: authUser, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    experience: '',
    bio: '',
    industry: '',
    skills: [] as string[],
    resume: null as string | null,
  });

  const [skillInput, setSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileId, setProfileId] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const dashboardRes = await apiClient.get('/core/students/dashboard/');
        const d = dashboardRes.data;
        setProfileId(d.profile_id);
        
        // Load existing skills from backend
        const skillsRes = await apiClient.get('/skills/student-skills/');
        const backendSkills = skillsRes.data.map((s: any) => s.skill_name || s.skill?.name);

        setFormData(prev => ({
          ...prev,
          name: authUser?.name || '',
          skills: backendSkills,
          // We could fetch more from /core/profiles/profileId/
        }));

        const profileRes = await apiClient.get(`/core/profiles/${d.profile_id}/`);
        const p = profileRes.data;
        setFormData(prev => ({
          ...prev,
          role: p.degree || '',
          experience: p.experience_level || '',
          bio: p.bio || '',
          industry: p.industry || '',
        }));

      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      setFormData({ ...formData, skills: [...formData.skills, trimmed] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;
    setIsSaving(true);
    
    try {
      // 1. Update Profile Info
      await apiClient.patch(`/core/profiles/${profileId}/`, {
        is_onboarded: true,
        degree: formData.role,
        experience_level: formData.experience,
        bio: formData.bio,
        industry: formData.industry,
      });

      // 2. Sync Skills (Bulk)
      // Note: A real implementation might diff or clear and re-add.
      // For simplicity in this stabilization phase, we'll use the bulk_create endpoint.
      await apiClient.post('/skills/student-skills/bulk_create/', {
        skills: formData.skills
      });

      // 3. Update local state
      updateUser({
        ...formData,
        isOnboarded: true
      });
      
      localStorage.setItem('is_onboarded', 'true');
      if (formData.name) localStorage.setItem('username', formData.name);

      await refreshUser();


      router.push('/dashboard/student');
    } catch (err) {
      console.error("FAILED TO SAVE PROFILE:", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = formData.name && formData.role && formData.experience && formData.bio && formData.industry;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-widest mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Onboarding & Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Complete your profile to unlock high-precision job matching.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-8 sm:p-10 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Personal Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                <input 
                  type="text"
                  required
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Desired Role *</label>
                <input 
                  type="text"
                  required
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Software Engineer"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Experience Level *</label>
                <select 
                  required
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={formData.experience}
                  onChange={e => setFormData({...formData, experience: e.target.value})}
                >
                  <option value="">Select Level</option>
                  <option value="Fresher">Fresher / Student</option>
                  <option value="Junior">Junior (1-2 years)</option>
                  <option value="Mid">Mid-Level (3-5 years)</option>
                  <option value="Senior">Senior (5+ years)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Industry *</label>
                <input 
                  type="text"
                  required
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="e.g. Technology, Finance"
                  value={formData.industry}
                  onChange={e => setFormData({...formData, industry: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Bio / Professional Summary *</label>
              <textarea 
                required
                rows={3}
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                placeholder="A brief overview of your professional journey..."
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
              />
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-8 sm:p-10 shadow-sm">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Technical Expertise</h2>
            
            <div className="flex gap-2 mb-6">
              <input 
                type="text"
                className="flex-1 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Add a skill (e.g. React, Python)"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <button 
                type="button"
                onClick={addSkill}
                className="px-8 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span 
                  key={`${skill}-${index}`} 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-black rounded-xl border border-blue-100 dark:border-blue-800"
                >
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-rose-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {formData.skills.length === 0 && (
                <p className="text-xs text-slate-400 font-bold italic py-4">Add your technical arsenal here...</p>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Resume</h2>
            <div className="space-y-4">
               <div className="relative border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500/30 transition-colors cursor-pointer group">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FileUp className="w-8 h-8 text-slate-300 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upload PDF/DOCX</p>
               </div>
            </div>
          </section>

          <div className="space-y-4">
            <button 
              type="submit"
              disabled={!isValid || isSaving}
              className={clsx(
                "w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-black rounded-[2rem] transition-all shadow-xl shadow-blue-500/20",
                (!isValid || isSaving) ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-95 shadow-blue-500/40"
              )}
            >
              {isSaving ? "Syncing Data..." : "Complete Onboarding"}
              {!isSaving && <Save className="w-4 h-4" />}
            </button>
            
            <button 
              type="button"
              onClick={() => router.replace('/dashboard/student')}
              className="w-full py-4 text-slate-500 font-black text-sm hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
