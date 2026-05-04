'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { 
  User, 
  Briefcase, 
  Code, 
  FileUp, 
  CheckCircle2, 
  X,
  ArrowLeft,
  Save
} from 'lucide-react';
import clsx from 'clsx';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    role: user.role || '',
    experience: user.experience || '',
    skills: user.skills || [] as string[],
    resume: user.resume || null as string | null,
  });

  const [skillInput, setSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, resume: file.name });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API delay
    setTimeout(() => {
      setUser({
        ...user,
        ...formData
      });
      setIsSaving(false);
      router.push('/dashboard/student/profile');
    }, 800);
  };

  const isValid = formData.name && formData.role;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-widest mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Profile
          </button>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Edit Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Keep your career details up to date for better job matching.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Fields */}
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

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Experience Level</label>
              <select 
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
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-8 sm:p-10 shadow-sm">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Technical Skills</h2>
            
            <div className="flex gap-2 mb-6">
              <input 
                type="text"
                className="flex-1 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Add a skill (e.g. TypeScript)"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <button 
                type="button"
                onClick={addSkill}
                className="px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:opacity-90 active:scale-95 transition-all"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.skills.map(skill => (
                <span 
                  key={skill} 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-black rounded-xl border border-blue-100 dark:border-blue-800"
                >
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-rose-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {formData.skills.length === 0 && (
                <p className="text-xs text-slate-400 font-bold italic py-4">Add your top skills for better matching...</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Resume Asset</h2>
            <div className="space-y-4">
               <div className="relative border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500/30 transition-colors cursor-pointer group">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                  <FileUp className="w-8 h-8 text-slate-300 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Replace File</p>
               </div>

               {formData.resume && (
                 <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl">
                   <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 truncate max-w-[120px]">{formData.resume}</span>
                   <button type="button" onClick={() => setFormData({...formData, resume: null})} className="text-rose-500"><X className="w-4 h-4"/></button>
                 </div>
               )}
            </div>
          </section>

          <div className="space-y-4">
            <button 
              type="submit"
              disabled={!isValid || isSaving}
              className={clsx(
                "w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-black rounded-[2rem] transition-all shadow-xl shadow-blue-500/20",
                (!isValid || isSaving) ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-95"
              )}
            >
              {isSaving ? "Saving Changes..." : "Save Profile"}
              {!isSaving && <Save className="w-4 h-4" />}
            </button>
            
            <button 
              type="button"
              onClick={() => router.back()}
              className="w-full py-4 text-slate-500 font-black text-sm hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel Edits
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
