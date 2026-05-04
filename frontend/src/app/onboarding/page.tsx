'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { 
  User, 
  Briefcase, 
  Code, 
  FileUp, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  X 
} from 'lucide-react';
import clsx from 'clsx';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [step, setStep] = useState(1);
  
  // Local Form State
  const [formData, setFormData] = useState({
    name: user.name || '',
    role: user.role || '',
    experience: user.experience || '',
    skills: user.skills || [] as string[],
    resume: user.resume || null as string | null,
  });

  const [skillInput, setSkillInput] = useState('');

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

  const handleFinish = () => {
    setUser({
      ...user,
      ...formData,
      isOnboarded: true,
    });
    router.push('/dashboard/student');
  };

  const isNextDisabled = () => {
    if (step === 1) return !formData.name || !formData.role;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 flex">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-8 sm:p-12">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-500/20">
              {step === 1 && <User className="w-8 h-8" />}
              {step === 2 && <Code className="w-8 h-8" />}
              {step === 3 && <FileUp className="w-8 h-8" />}
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              {step === 1 && "Basic Information"}
              {step === 2 && "Technical Skills"}
              {step === 3 && "Resume Upload"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Step {step} of 3
            </p>
          </div>

          {/* Form Content */}
          <div className="space-y-6 min-h-[300px]">
            {step === 1 && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input 
                    type="text"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Desired Role</label>
                  <input 
                    type="text"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Fullstack Developer"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Experience Level</label>
                  <select 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={formData.experience}
                    onChange={e => setFormData({...formData, experience: e.target.value})}
                  >
                    <option value="">Select Experience</option>
                    <option value="Fresher">Fresher / Student</option>
                    <option value="Junior">Junior (1-2 years)</option>
                    <option value="Mid">Mid-Level (3-5 years)</option>
                    <option value="Senior">Senior (5+ years)</option>
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Core Skills</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="e.g. React"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addSkill()}
                  />
                  <button 
                    onClick={addSkill}
                    className="px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:opacity-90 active:scale-95 transition-all"
                  >
                    Add
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.skills.map(skill => (
                    <span 
                      key={skill} 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-black rounded-xl border border-blue-100 dark:border-blue-800"
                    >
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-rose-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {formData.skills.length === 0 && (
                    <p className="text-xs text-slate-400 font-bold italic py-4">No skills added yet...</p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 text-center">
                <div className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] p-12 hover:border-blue-500/20 transition-colors group cursor-pointer relative">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors mb-4">
                      <FileUp className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">Click or drag to upload resume</p>
                    <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-wide">PDF, DOCX supported</p>
                  </div>
                </div>

                {formData.resume && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 truncate max-w-[200px]">
                        {formData.resume}
                      </span>
                    </div>
                    <button 
                      onClick={() => setFormData({...formData, resume: null})}
                      className="text-xs font-black text-rose-500 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button 
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-8 py-4 text-slate-500 dark:text-slate-400 font-black text-sm hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button 
                disabled={isNextDisabled()}
                onClick={() => setStep(s => s + 1)}
                className={clsx(
                  "flex items-center gap-2 px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm rounded-2xl transition-all shadow-xl shadow-slate-200 dark:shadow-none",
                  isNextDisabled() ? "opacity-30 cursor-not-allowed grayscale" : "hover:scale-105 active:scale-95"
                )}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleFinish}
                className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white font-black text-sm rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
              >
                Complete Onboarding
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
