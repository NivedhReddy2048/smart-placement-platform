'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Trophy, 
  Target, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  TrendingUp, 
  BookOpen, 
  Briefcase,
  AlertCircle,
  BarChart3
} from "@/components/Icons";
import clsx from 'clsx';
import apiClient from "@/lib/axios";

// ── 1. AI RESULT ENGINE (Simulated) ──────────────────────────────────────────

export default function InterviewResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await apiClient.get('/mock/result/');
        const data = res.data;
        
        let verdict = "Needs Improvement";
        let color = "text-rose-500";
        if (data.score > 80) {
          verdict = "Strong Candidate";
          color = "text-emerald-500";
        } else if (data.score > 70) {
          verdict = "Good Potential";
          color = "text-blue-500";
        }

        const strengths: string[] = [];
        const improvements: string[] = [];
        
        // Parse feedback list
        data.feedback?.forEach((f: any) => {
          if (f.score >= 8) strengths.push(`Excellent on: ${f.question.substring(0, 40)}...`);
          else improvements.push(`Review needed for: ${f.question.substring(0, 40)}...`);
        });

        // Add dummy ones if empty to keep UI looking good
        if (strengths.length === 0) strengths.push("Good attempt at attempting all questions.");
        if (improvements.length === 0) improvements.push("Continue practicing across all domains.");

        setResult({
          score: data.score,
          verdict,
          color,
          skills: {
            dsa: Math.floor(data.score * 0.9),
            system: Math.floor(data.score * 0.95),
            communication: Math.floor(data.score * 0.8),
          },
          strengths,
          improvements
        });
      } catch (err) {
        console.error("Failed to fetch mock result:", err);
      }
    };
    fetchResult();
  }, []);

  if (!result) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-8" />
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">AI Calibration in Progress</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 animate-pulse">Our recruiter is analyzing your logical flow and technical depth...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Header */}
      <div className="mb-10">
        <button 
          onClick={() => router.push('/dashboard/student/prep-guide')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Prep Guide
        </button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest">
                   Session Complete
                 </div>
                 <span className="text-xs font-bold text-slate-400">ID: #AI-992-MOCK</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Interview Intelligence</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-3">Target: <span className="text-slate-900 dark:text-white font-black">Junior Web Developer</span> at <span className="text-rose-500 font-black underline decoration-rose-500/20">Zomato</span></p>
           </div>
           <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="p-3 bg-blue-500/10 rounded-2xl">
                 <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Growth</p>
                 <p className="text-sm font-bold text-slate-900 dark:text-white">+12% Success Probability</p>
              </div>
           </div>
        </div>
      </div>

      {/* Main Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
         <div className="lg:col-span-1 p-10 bg-slate-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col justify-center items-center text-center">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Trophy className="w-32 h-32" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Performance Score</p>
            <div className="text-7xl font-black text-emerald-400 mb-6 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
               {result.score}%
            </div>
            <div className={clsx("px-6 py-2 bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10", result.color)}>
               {result.verdict}
            </div>
         </div>

         <div className="lg:col-span-2 p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Sparkles className="w-24 h-24" />
            </div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] mb-10 flex items-center gap-2">
               <BarChart3 className="w-4 h-4 text-blue-500" /> Skill Calibration
            </h2>
            <div className="space-y-8">
               {[
                 { label: "DSA & Problem Solving", value: result.skills.dsa, color: "bg-blue-500", icon: <TrendingUp className="w-4 h-4" /> },
                 { label: "System Design Depth", value: result.skills.system, color: "bg-emerald-500", icon: <Target className="w-4 h-4" /> },
                 { label: "Communication & Clarity", value: result.skills.communication, color: "bg-amber-500", icon: <Briefcase className="w-4 h-4" /> },
               ].map((skill) => (
                 <div key={skill.label}>
                    <div className="flex justify-between items-end mb-3">
                       <span className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2 uppercase tracking-tight">
                          {skill.icon} {skill.label}
                       </span>
                       <span className="text-sm font-black text-slate-900 dark:text-white">{skill.value}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700">
                       <div 
                         className={clsx("h-full transition-all duration-1000", skill.color)} 
                         style={{ width: `${skill.value}%` }} 
                       />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
         <div className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <CheckCircle2 className="w-24 h-24 text-emerald-500" />
            </div>
            <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.25em] mb-8 flex items-center gap-2">
               <Zap className="w-4 h-4" /> Core Strengths
            </h3>
            <ul className="space-y-6">
               {result.strengths.map((s: string, i: number) => (
                 <li key={i} className="flex items-start gap-4 text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                    <div className="mt-1 p-1 bg-emerald-500/10 rounded-lg">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    {s}
                 </li>
               ))}
            </ul>
         </div>

         <div className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <AlertCircle className="w-24 h-24 text-rose-500" />
            </div>
            <h3 className="text-xs font-black text-rose-500 uppercase tracking-[0.25em] mb-8 flex items-center gap-2">
               <Target className="w-4 h-4" /> Critical Improvements
            </h3>
            <ul className="space-y-6">
               {result.improvements.map((s: string, i: number) => (
                 <li key={i} className="flex items-start gap-4 text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                    <div className="mt-1 p-1 bg-rose-500/10 rounded-lg">
                       <Zap className="w-4 h-4 text-rose-500" />
                    </div>
                    {s}
                 </li>
               ))}
            </ul>
         </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16">
         <button 
           onClick={() => router.push('/dashboard/student/applications')}
           className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3"
         >
           BACK TO APPLICATIONS <Briefcase className="w-5 h-5" />
         </button>
         <button 
           onClick={() => router.push('/dashboard/student/prep-guide')}
           className="w-full sm:w-auto px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3"
         >
           IMPROVE CORE SKILLS <BookOpen className="w-5 h-5" />
         </button>
      </div>

    </div>
  );
}
