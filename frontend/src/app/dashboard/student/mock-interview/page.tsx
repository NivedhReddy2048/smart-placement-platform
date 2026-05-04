'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Mic, 
  Video, 
  Settings, 
  Play, 
  AlertCircle,
  Sparkles,
  Trophy,
  Target,
  X,
  CheckCircle2,
  Send,
  MessageSquare,
  Code2,
  RotateCcw
} from "@/components/Icons";
import clsx from 'clsx';
import apiClient from "@/lib/axios";

// Dynamic data fetched from backend

export default function MockInterviewPage() {
  const router = useRouter();
  
  // ── 2. CORE STATE ────────────────────────────────────────────────────────
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(900); // 15 min
  const [ended, setEnded] = useState(false);

  // API State
  const [questions, setQuestions] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [allAnswers, setAllAnswers] = useState<Record<string, string>>({});

  // Personalized Context
  const context = {
    role: "Junior Web Developer",
    company: "Zomato"
  };

  const guidelines = [
    { title: "Technical Clarity", text: "Explain your thought process as you solve the problem. AI tracks logical flow." },
    { title: "STAR Method", text: "Use Situation, Task, Action, and Result for behavioral questions." },
    { title: "Code Optimization", text: "Start with a working solution, then discuss time/space trade-offs." },
    { title: "Professionalism", text: "Maintain eye contact with the camera and speak clearly." }
  ];

  // ── 3. INTERVIEW LOGIC ────────────────────────────────────────────────────

  const startInterview = async () => {
    try {
      setLoading(true);
      const res = await apiClient.post('/mock/start/');
      setSessionId(res.data.session_id);
      setQuestions(res.data.questions);
      setShowGuidelines(false);
      setStarted(true);
    } catch (err) {
      console.error("Failed to start mock interview:", err);
      // fallback handling if needed
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSubmit = async () => {
    if (!answer.trim() || questions.length === 0) return;
    setLoading(true);

    const currentQuestionId = questions[step].id;
    const newAnswers = { ...allAnswers, [currentQuestionId]: answer };
    setAllAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
      setAnswer("");
      setLoading(false);
    } else {
      try {
        await apiClient.post('/mock/submit/', {
          session_id: sessionId,
          answers: newAnswers
        });
        setSubmitted(true);
        router.push('/dashboard/student/interview-result');
      } catch (err) {
        console.error("Failed to submit mock interview:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // ── 4. EFFECTS ────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowGuidelines(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (!started || submitted || ended) return;

    const timer = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(timer);
          router.push('/dashboard/student/interview-result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, submitted, ended, router]);

  // ── 5. RENDER COMPONENTS ──────────────────────────────────────────────────

  const EndScreen = () => (
    <div className="max-w-2xl mx-auto py-32 text-center animate-in fade-in duration-700">
       <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <AlertCircle className="w-10 h-10 text-rose-500" />
       </div>
       <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Interview Ended</h2>
       <p className="text-slate-500 dark:text-slate-400 font-medium mb-12">You exited the session early. No performance data was recorded for this attempt.</p>
       <button 
          onClick={() => router.push('/dashboard/student/prep-guide')}
          className="px-10 py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
       >
          BACK TO DASHBOARD
       </button>
    </div>
  );

  // ── 6. MAIN RENDER ────────────────────────────────────────────────────────

  if (ended) return <EndScreen />;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto pb-24 animate-in fade-in duration-700 relative">
      
      {/* Guidelines Modal */}
      {showGuidelines && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowGuidelines(false)}
          />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 sm:p-10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Session Guidelines</h2>
                <button 
                  onClick={() => setShowGuidelines(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
                Preparing for: <span className="text-blue-500">{context.role}</span> at {context.company}
              </p>
              
              <div className="space-y-6">
                {guidelines.map((g, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wide mb-1">{g.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{g.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={startInterview}
                className="w-full mt-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-500/20"
              >
                I UNDERSTAND, LET'S GO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main UI Toggle */}
      {!started ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Navigation */}
          <button 
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Prep Guide
          </button>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
               <div className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black rounded-lg border border-blue-500/20 uppercase tracking-widest">
                 AI Interview Engine
               </div>
               <span className="text-xs font-bold text-slate-400">Status: Calibrated & Ready</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              AI Mock Interview
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-3 max-w-2xl leading-relaxed">
              Our AI recruiter will simulate a real technical and behavioral interview based on your applied roles. Ensure your microphone and camera are ready for the session.
            </p>
          </div>

          {/* Setup Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: <Mic className="w-6 h-6 text-blue-500" />, label: "Audio", status: "Connected" },
              { icon: <Video className="w-6 h-6 text-emerald-500" />, label: "Camera", status: "Calibrated" },
              { icon: <Settings className="w-6 h-6 text-slate-500" />, label: "Latency", status: "Optimal" }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                   {item.icon}
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                   <p className="text-sm font-bold text-slate-900 dark:text-white">{item.status}</p>
                 </div>
              </div>
            ))}
          </div>

          {/* Start Session Card */}
          <div className="bg-slate-900 text-white p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <Sparkles className="w-48 h-48" />
             </div>
             
             <div className="relative z-10 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/40 animate-pulse">
                   <Play className="w-8 h-8 text-white ml-1" />
                </div>
                <h2 className="text-3xl font-black mb-4 tracking-tight">Ready to Begin?</h2>
                <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                  This session for <span className="text-white font-bold">{context.company}</span> will last approximately <span className="text-white font-bold">15 minutes</span>. 
                  You will receive a detailed performance report and a hiring verdict at the end.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={() => setShowGuidelines(true)}
                    className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
                  >
                    START INTERVIEW SESSION
                  </button>
                  <button 
                    onClick={() => setShowGuidelines(true)}
                    className="w-full sm:w-auto px-10 py-5 bg-white/5 text-white font-black rounded-[1.5rem] hover:bg-white/10 transition-all border border-white/10 relative z-10"
                  >
                    VIEW GUIDELINES
                  </button>
                </div>
             </div>
          </div>

          {/* Advice Grid (Only on Landing) */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-1000">
             <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-6">
                   <div className="p-3 bg-rose-500/10 rounded-2xl">
                     <Target className="w-6 h-6 text-rose-500" />
                   </div>
                   <h3 className="text-xl font-black text-slate-900 dark:text-white">What to expect</h3>
                </div>
                <ul className="space-y-4">
                   {[
                     "Technical deep-dive on core skills",
                     "Behavioral scenario questions",
                     "Live code snippets analysis",
                     "Real-time feedback markers"
                   ].map((text, i) => (
                     <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {text}
                     </li>
                   ))}
                </ul>
             </div>

             <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-6">
                   <div className="p-3 bg-emerald-500/10 rounded-2xl">
                     <Trophy className="w-6 h-6 text-emerald-500" />
                   </div>
                   <h3 className="text-xl font-black text-slate-900 dark:text-white">Session Benefits</h3>
                </div>
                <ul className="space-y-4">
                   {[
                     "Improve confidence by 40%",
                     "Refine technical explanations",
                     "Identify hidden communication gaps",
                     "Earn 'Interview Ready' badge"
                   ].map((text, i) => (
                     <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {text}
                     </li>
                   ))}
                </ul>
             </div>
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-8 fade-in duration-700">
           {/* Interview Screen */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-rose-500/10 rounded-2xl">
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Question {step + 1} of {questions.length}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: Session in progress</p>
                 </div>
              </div>
              <div className="px-8 py-3 bg-slate-900 dark:bg-slate-800 rounded-[1.25rem] border border-slate-800 dark:border-slate-700 font-black text-sm text-white tracking-tighter flex items-center gap-3 shadow-xl">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                 TIME REMAINING: {formatTime(time)}
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl mb-8 relative overflow-hidden group/card">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover/card:scale-110 transition-transform duration-700">
                 <Code2 className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                 <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Question {step + 1}
                 </h3>
                 <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-10 leading-tight tracking-tight">
                    {questions[step]?.question || "Loading question..."}
                 </p>
                 <div className="relative">
                    <textarea 
                       value={answer}
                       onChange={(e) => setAnswer(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-slate-800/40 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium leading-relaxed focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-400 shadow-inner resize-none"
                       rows={8}
                       placeholder="Structure your answer using the STAR method or technical reasoning..."
                    />
                    {loading && (
                       <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-[2.5rem] animate-in fade-in duration-300">
                          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                          <p className="text-sm font-black text-blue-600 animate-pulse tracking-widest uppercase">AI Evaluator is analyzing...</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row items-center justify-between gap-8 p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-lg">
              <div className="flex items-center gap-5">
                 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <MessageSquare className="w-6 h-6 text-slate-400" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Think out loud and be specific.</p>
                    <button 
                       onClick={() => setEnded(true)}
                       className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline mt-1"
                    >
                       End Interview Session
                    </button>
                 </div>
              </div>
              <button 
                 onClick={handleSubmit}
                 disabled={!answer.trim() || loading}
                 className="w-full sm:w-auto px-14 py-5 bg-blue-600 text-white font-black rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 group/btn"
              >
                 {step === questions.length - 1 ? "FINISH INTERVIEW" : "SUBMIT & NEXT"}
                 <Send className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
